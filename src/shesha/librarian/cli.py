"""Librarian CLI: installer, headless commands, and MCP front door."""

from __future__ import annotations

import argparse
import os
import json
import subprocess
import sys
import sysconfig
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import docker
from docker.errors import DockerException, ImageNotFound

from shesha import __version__
from shesha.exceptions import SheshaError
from shesha.librarian.core import LibrarianCore, ValidationError, get_or_create_bridge_secret
from shesha.librarian.config import set_manifest_dir
from shesha.librarian.manifest import LibrarianManifest, SelfTestStatus
from shesha.librarian.mcp_jsonrpc import encode_message, parse_messages
from shesha.librarian.paths import LibrarianPaths, resolve_paths
from shesha.sandbox.executor import ContainerExecutor

SUPPORTED_MODES = ["cli", "mcp"]
SUPPORTED_ENV_VARS = [
    "LIBRARIAN_HOME",
    "LIBRARIAN_STORAGE_PATH",
    "LIBRARIAN_LOG_DIR",
    "SHESHA_MODEL",
    "SHESHA_API_KEY",
]


@dataclass(frozen=True)
class InstallResult:
    ok: bool
    details: str


def _utc_now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _default_manifest_dir() -> Path:
    return Path.cwd()


def _manifest_path(manifest_dir: Path) -> Path:
    return manifest_dir / ".librarian" / "manifest.json"


def _readme_path(manifest_dir: Path) -> Path:
    return manifest_dir / "mcp-server-readme.md"


def _scripts_dir() -> Path:
    scripts = sysconfig.get_path("scripts")
    if scripts:
        return Path(scripts).resolve()
    return Path(sys.executable).resolve().parent


def _find_console_script(name: str) -> Path | None:
    scripts_dir = _scripts_dir()
    candidates = [
        name,
        f"{name}.exe",
        f"{name}.cmd",
        f"{name}.bat",
        f"{name}-script.py",
    ]
    for candidate in candidates:
        path = scripts_dir / candidate
        if path.exists():
            return path
    return None


def _resolve_manifest_invocation() -> tuple[dict[str, str], dict[str, list[str]]]:
    python = str(Path(sys.executable).resolve())
    cli_script = _find_console_script("librarian")
    if cli_script is not None:
        cli_cmd = [str(cli_script)]
        mcp_cmd = [str(cli_script), "mcp"]
    else:
        cli_cmd = [python, "-m", "shesha.librarian"]
        mcp_cmd = [python, "-m", "shesha.librarian", "mcp"]

    entrypoints = {"cli": cli_cmd[0], "mcp": mcp_cmd[0]}
    commands = {"cli": cli_cmd, "mcp": mcp_cmd}
    return entrypoints, commands


def _sandbox_source_dir() -> Path | None:
    # Prefer installed package path when available.
    shesha_dir = Path(__file__).resolve().parents[1]
    candidate = shesha_dir / "sandbox"
    if (candidate / "Dockerfile").exists():
        return candidate

    # Fallback: repo layout (when running from a source checkout).
    candidate = Path.cwd() / "src" / "shesha" / "sandbox"
    if (candidate / "Dockerfile").exists():
        return candidate

    return None


def _ensure_sandbox_image(image: str) -> tuple[bool, str]:
    """Ensure the sandbox Docker image exists, building it if missing.

    Uses context manager to guarantee Docker client cleanup.
    """
    client = None
    try:
        client = docker.from_env()
        try:
            client.images.get(image)
            return True, "sandbox_image: present"
        except ImageNotFound:
            sandbox_dir = _sandbox_source_dir()
            if sandbox_dir is None:
                return False, "Sandbox Dockerfile not found; cannot build image automatically."

            try:
                client.images.build(
                    path=str(sandbox_dir),
                    dockerfile="Dockerfile",
                    tag=image,
                    rm=True,
                )
            except Exception as e:  # noqa: BLE001 - surfaced to operator
                return False, f"Failed to build sandbox image '{image}': {e}"
            return True, "sandbox_image: built"
    except DockerException as e:
        return False, f"Docker unavailable: {e}"
    finally:
        if client is not None:
            client.close()


def _write_readme(*, path: Path, storage_path: Path, logs_path: Path, manifest_path: Path) -> None:
    content = f"""# Librarian MCP Server (Shesha RLM)

This installation provides:

- **CLI mode (headless):** run queries and manage projects from a terminal
- **MCP mode (stdio):** run as a Model Context Protocol server over stdin/stdout

## Persistent state + logs

- Storage: `{storage_path}`
- Logs: `{logs_path}`

To override defaults:

- `LIBRARIAN_STORAGE_PATH` (storage root for projects)
- `LIBRARIAN_LOG_DIR` (log directory)
- `LIBRARIAN_HOME` (base directory used when the above are not set)

Back up `{storage_path}` to preserve projects/documents.

## Canonical commands

Run MCP server (stdio):

```bash
python -m shesha.librarian mcp
```

Run headless query:

```bash
python -m shesha.librarian query --project <project_id> \"<question>\"
```

Local manifest:

- `{manifest_path}`
"""
    path.write_text(content)


def _write_install_artifacts(
    *,
    manifest_path: Path,
    readme_path: Path,
    storage_path: Path,
    logs_path: Path,
    self_test: SelfTestStatus,
    docker_available: bool = True,
) -> None:
    entrypoints, commands = _resolve_manifest_invocation()
    LibrarianManifest(
        package_name="shesha",
        package_version=__version__,
        entrypoints=entrypoints,
        commands=commands,
        storage_path=str(storage_path),
        logs_path=str(logs_path),
        supported_modes=SUPPORTED_MODES,
        env_vars=SUPPORTED_ENV_VARS,
        self_test=self_test,
        docker_available=docker_available,
    ).write(manifest_path)
    _write_readme(
        path=readme_path,
        storage_path=storage_path,
        logs_path=logs_path,
        manifest_path=manifest_path,
    )


def _perform_system_audit() -> tuple[bool, str]:
    """Audit the runtime environment (Python version, venv, dependencies).

    Performs critical pre-flight checks before installation:
    1. Python version >= 3.11 (hard requirement)
    2. Virtual environment detection (strong recommendation)

    Returns:
        (ok, details): ok=False stops installation; ok=True continues with warning if needed.

    Security note: This function only reads system state (sys.version_info, sys.prefix).
    No external input is processed, so there are no injection risks.
    """
    try:
        # 1. Python Version Check (hard requirement)
        major, minor = sys.version_info.major, sys.version_info.minor
        if (major, minor) < (3, 11):
            return False, (
                f"❌ Python {major}.{minor} detected. "
                "Shesha requires Python 3.11 or higher. Please upgrade and try again."
            )

        # 2. Virtual Environment Awareness (strong recommendation)
        in_venv = sys.prefix != sys.base_prefix
        env_msg = ""
        if not in_venv:
            env_msg = (
                "⚠️  Warning: You are running in a global Python environment.\n"
                "  Recommendation: Use a virtual environment to avoid package conflicts.\n"
                "  Quick fix: python3 -m venv .venv && source .venv/bin/activate\n\n"
            )

        # Success message
        details = f"{env_msg}✓ Python v{major}.{minor} (ok)"
        return True, details

    except Exception as e:  # noqa: BLE001 - defensive catch for unexpected system state
        # Fallback: if we can't determine version or venv status, proceed with warning
        # This should never happen but protects against unexpected platform issues
        return True, f"⚠️  System audit incomplete (non-critical): {e}"


def _prompt_docker_options() -> str:
    """Prompt user for Docker installation options if in a TTY."""
    if not sys.stdin.isatty():
        return "fail"

    print("\n" + "=" * 60)
    print("DOCKER NOT DETECTED".center(60))
    print("=" * 60)
    print("Shesha requires Docker to run code in a secure sandbox.")
    print("Without Docker, you can still manage projects and index files,")
    print("but you will NOT be able to run queries.\n")

    if sys.platform == "darwin":
        print("Suggested for macOS: Install via Homebrew")
        print("  brew install --cask docker\n")

    print("How would you like to proceed?")
    print("  1) [Guide] Show me how to install Docker")
    print("  2) [Skip] Proceed without Docker (queries will be disabled)")
    print("  3) [Abort] Stop installation")

    while True:
        try:
            choice = input("\nChoice [1-3]: ").strip()
            if choice == "1":
                return "guide"
            if choice == "2":
                return "skip"
            if choice in ("3", "q", "quit"):
                return "abort"
        except (KeyboardInterrupt, EOFError):
            return "abort"


def _show_docker_install_guide() -> None:
    """Display platform-specific Docker installation instructions."""
    print("\n" + "-" * 60)
    print("DOCKER INSTALLATION GUIDE".center(60))
    print("-" * 60)

    if sys.platform == "darwin":
        print("Option A: Docker Desktop (Recommended)")
        print("  Download from: https://www.docker.com/products/docker-desktop\n")
        print("Option B: Homebrew")
        print("  brew install --cask docker\n")
        print("Option C: Colima (Lightweight)")
        print("  brew install colima")
        print("  colima start\n")
    elif sys.platform == "linux":
        print("Follow the official guide for your distribution:")
        print("  https://docs.docker.com/engine/install/\n")
        print("Quick install script:")
        print("  curl -fsSL https://get.docker.com -o get-docker.sh")
        print("  sudo sh get-docker.sh\n")
    else:
        print("Download Docker Desktop for Windows:")
        print("  https://www.docker.com/products/docker-desktop\n")

    print("-" * 60)
    input("Press Enter once Docker is installed and running, or to continue...")


def _self_test_mcp_server(*, storage_path: Path) -> tuple[bool, str]:
    """Start MCP server and call `health` tool over stdio."""
    proc = subprocess.Popen(
        [sys.executable, "-m", "shesha.librarian.mcp", "--storage-path", str(storage_path)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    try:
        input_data = b"".join(
            [
                encode_message(
                    {
                        "jsonrpc": "2.0",
                        "id": 1,
                        "method": "initialize",
                        "params": {
                            "protocolVersion": "2024-11-05",
                            "capabilities": {},
                            "clientInfo": {
                                "name": "librarian-installer",
                                "version": __version__,
                            },
                        },
                    }
                ),
                encode_message(
                    {
                        "jsonrpc": "2.0",
                        "id": 2,
                        "method": "tools/call",
                        "params": {"name": "health", "arguments": {}},
                    }
                ),
            ]
        )

        stdout, stderr = proc.communicate(input=input_data, timeout=10)
        messages = parse_messages(stdout)

        init_resp = next((m for m in messages if m.get("id") == 1), None)
        if not init_resp or "result" not in init_resp:
            return False, "Missing initialize response"

        health_resp = next((m for m in messages if m.get("id") == 2), None)
        if not health_resp or "result" not in health_resp:
            return False, "Missing health response"

        content = health_resp.get("result", {}).get("content", [])
        if not content:
            return False, "MCP health tool returned no content"

        text = str(content[0].get("text", ""))
        try:
            payload = json.loads(text)
        except json.JSONDecodeError:
            payload = None
        if not isinstance(payload, dict) or payload.get("status") != "ok":
            return False, f"MCP health tool did not report ok: {text[:200]}"

        return True, "mcp: ok"
    except Exception as e:  # noqa: BLE001 - returned as self-test failure
        try:
            proc.kill()
            stdout, stderr = proc.communicate(timeout=2)
        except Exception:
            stdout, stderr = b"", b""
        details = str(e)
        err_text = stderr.decode("utf-8", errors="replace").strip()
        if err_text:
            details = f"{details}\n{err_text}"
        out_text = stdout.decode("utf-8", errors="replace").strip()
        if out_text:
            details = f"{details}\n{out_text}"
        return False, details
    finally:
        if proc.poll() is None:
            proc.kill()


def _self_test_sandbox(*, image: str = "shesha-sandbox") -> tuple[bool, str]:
    """Validate the sandbox image can start and respond to a ping."""
    try:
        ok, details = _ensure_sandbox_image(image)
        if not ok:
            hint = ""
            sandbox_dir = _sandbox_source_dir()
            if sandbox_dir is not None:
                dockerfile = sandbox_dir / "Dockerfile"
                hint = (
                    "\n\nBuild the sandbox image manually:\n"
                    f"  docker build -t {image} -f {dockerfile} {sandbox_dir}"
                )
            return False, f"{details}{hint}"

        executor = ContainerExecutor(image=image)
        executor.start()
        # Private protocol: runner.py supports {"action": "ping"}.
        result: dict[str, Any] = executor._send_command({"action": "ping"})
        executor.stop()
        if result.get("status") != "ok":
            return False, f"Sandbox ping returned: {result}"
        return True, "Sandbox container responded to ping"
    except Exception as e:  # noqa: BLE001 - returned as failure
        return False, f"Sandbox self-test failed: {e}"


def run_install(
    *,
    paths: LibrarianPaths,
    manifest_dir: Path,
    skip_docker: bool,
    skip_sandbox: bool,
) -> InstallResult:
    manifest_path = _manifest_path(manifest_dir)
    readme_path = _readme_path(manifest_dir)
    paths.ensure_dirs()

    # 0) System Audit: Pre-flight environment validation
    #    - Validates Python >= 3.11 (hard requirement, exits if fails)
    #    - Detects virtual environment usage (soft requirement, warns if not used)
    #    - Provides actionable guidance for each issue
    #    - Safe to run: only reads sys.version_info and sys.prefix
    print("Self-test: System audit…")
    system_ok, system_details = _perform_system_audit()
    if not system_ok:
        # Critical failure: Python version too old, cannot proceed
        return InstallResult(ok=False, details=system_details)
    print(f"  {system_details.strip()}")

    # 1) MCP loopback self-test (server starts and responds).
    print("Self-test: MCP stdio (initialize + health)…")
    mcp_ok, mcp_details = _self_test_mcp_server(storage_path=paths.storage)
    if not mcp_ok:
        status = SelfTestStatus(
            ok=False, timestamp=_utc_now_iso(), details=f"MCP self-test failed: {mcp_details}"
        )
        _write_install_artifacts(
            manifest_path=manifest_path,
            readme_path=readme_path,
            storage_path=paths.storage,
            logs_path=paths.logs,
            self_test=status,
        )
        return InstallResult(ok=False, details=status.details)
    print(f"  {mcp_details}")

    # 2) Docker/sandbox validation (required for queries).
    print("Self-test: Docker daemon…")
    from shesha.shesha import Shesha as SheshaClass

    if skip_docker:
        docker_available = False
        print("  docker: skipped (--skip-docker)")
    elif SheshaClass._is_docker_available():
        docker_available = True
        print("  docker: ok")
    else:
        docker_available = False
        msg = "Docker is not running. Start Docker Desktop (or equivalent) before installing."
        print(f"  {msg}")

    if docker_available and not skip_sandbox:
        print("Self-test: sandbox image + ping…")
        sandbox_ok, sandbox_details = _self_test_sandbox()
        if not sandbox_ok:
            status = SelfTestStatus(
                ok=False,
                timestamp=_utc_now_iso(),
                details=sandbox_details,
                docker_available=True,
            )
            _write_install_artifacts(
                manifest_path=manifest_path,
                readme_path=readme_path,
                storage_path=paths.storage,
                logs_path=paths.logs,
                self_test=status,
                docker_available=True,
            )
            return InstallResult(ok=False, details=status.details)
        print("  sandbox: ok")
    elif not skip_sandbox:
        print("Self-test: sandbox image + ping… skipped (no Docker)")
    else:
        print("Self-test: sandbox image + ping… skipped")

    # 3) Write manifest + readme.
    docker_status = "docker: skip" if not docker_available else "docker: ok"
    sandbox_status = "sandbox: skipped" if not docker_available or skip_sandbox else "sandbox: ok"
    details = "; ".join(
        [system_details.split("\n")[-1], mcp_details, docker_status, sandbox_status]
    )
    status = SelfTestStatus(
        ok=True,
        timestamp=_utc_now_iso(),
        details=details,
        docker_available=docker_available,
    )
    _write_install_artifacts(
        manifest_path=manifest_path,
        readme_path=readme_path,
        storage_path=paths.storage,
        logs_path=paths.logs,
        self_test=status,
        docker_available=docker_available,
    )

    return InstallResult(ok=True, details=status.details)


def _print_install_summary(*, paths: LibrarianPaths, manifest_dir: Path) -> None:
    manifest_path = _manifest_path(manifest_dir)
    readme_path = _readme_path(manifest_dir)
    print("Librarian install complete.\n")
    print("State + logs:")
    print(f"  storage: {paths.storage}")
    print(f"  logs:    {paths.logs}\n")
    try:
        manifest = LibrarianManifest.read(manifest_path)
        if manifest.self_test is not None:
            print("Self-test:")
            print(f"  ok:      {manifest.self_test.ok}")
            print(f"  details: {manifest.self_test.details}\n")
    except Exception:
        pass
    print("To override defaults:")
    print("  LIBRARIAN_STORAGE_PATH, LIBRARIAN_LOG_DIR, or LIBRARIAN_HOME\n")
    print("Back up:")
    print(f"  {paths.storage}\n")
    print("Next steps:")
    print("  MCP (stdio):")
    print("    python -m shesha.librarian mcp")
    print("    docker must be running before starting MCP query workflows.")
    print("  Headless query:")
    print('    python -m shesha.librarian query --project <project_id> "<question>"\n')
    print("GUI + Bridge:")
    print("    python -m shesha.librarian bridge  # starts API on http://127.0.0.1:8000")
    print("    python -m shesha.librarian gui     # opens GUI on http://localhost:$LIBRARIAN_GUI_PORT")
    print("    npm run dev (inside gui/)  # optional operator UI (Vite chooses the port)")
    print("Local outputs:")
    print(f"  manifest: {manifest_path}")
    print(f"  readme:   {readme_path}")


def _offer_path_setup() -> None:
    if not sys.stdin.isatty():
        return

    print("\nOptional: add Librarian venv to PATH so `librarian` is available everywhere.")
    print("  1) Add to PATH now")
    print("  2) Skip")
    choice = input("Choose [1-2]: ").strip()
    if choice != "1":
        return

    venv_bin = Path(".venv") / "bin"
    if sys.platform.startswith("win"):
        venv_bin = Path(".venv") / "Scripts"

    export_line = f'export PATH="{venv_bin.resolve()}:$PATH"'
    shell = os.environ.get("SHELL", "")
    rc_file = None
    if shell.endswith("zsh"):
        rc_file = Path.home() / ".zshrc"
    elif shell.endswith("bash"):
        rc_file = Path.home() / ".bashrc"

    if rc_file is None:
        print("Could not detect shell rc file. Add this manually:")
        print(f"  {export_line}")
        return

    with rc_file.open("a", encoding="utf-8") as handle:
        handle.write(f"\n{export_line}\n")
    print(f"Added to PATH in {rc_file}")


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="librarian",
        description="Librarian (Shesha RLM) tool + MCP server",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    install = sub.add_parser(
        "install",
        help="Initialize state, run self-test, and write local manifest/readme",
    )
    install.add_argument(
        "--storage-path",
        type=Path,
        default=None,
        help="Override storage directory",
    )
    install.add_argument(
        "--log-dir",
        type=Path,
        default=None,
        help="Override logs directory",
    )
    install.add_argument(
        "--manifest-dir",
        type=Path,
        default=None,
        help="Directory to write .librarian/manifest.json and mcp-server-readme.md (default: cwd)",
    )
    install.add_argument(
        "--skip-docker",
        action="store_true",
        help="Skip Docker daemon availability check",
    )
    install.add_argument(
        "--skip-sandbox",
        action="store_true",
        help="Skip sandbox container ping test",
    )

    mcp = sub.add_parser("mcp", help="Run as an MCP server over stdio")
    mcp.add_argument("--storage-path", type=Path, default=None, help="Override storage directory")
    mcp.add_argument("--log-dir", type=Path, default=None, help="Override logs directory")
    mcp.add_argument(
        "--model",
        type=str,
        default=None,
        help="Override SHESHA_MODEL for queries",
    )
    mcp.add_argument(
        "--api-key",
        type=str,
        default=None,
        help="Override SHESHA_API_KEY for queries",
    )

    query = sub.add_parser("query", help="Headless query against a project")
    query.add_argument("--project", required=True, help="Project ID")
    query.add_argument("question", help="Question to ask")
    query.add_argument(
        "--storage-path",
        type=Path,
        default=None,
        help="Override storage directory",
    )
    query.add_argument("--model", type=str, default=None, help="Override SHESHA_MODEL")
    query.add_argument("--api-key", type=str, default=None, help="Override SHESHA_API_KEY")

    projects = sub.add_parser("projects", help="Manage projects")
    proj_sub = projects.add_subparsers(dest="projects_cmd", required=True)
    proj_sub.add_parser("list", help="List projects").add_argument(
        "--storage-path",
        type=Path,
        default=None,
        help="Override storage directory",
    )
    create = proj_sub.add_parser("create", help="Create a project")
    create.add_argument("project_id")
    create.add_argument(
        "--mount-path",
        type=Path,
        default=None,
        help="Local directory to mount/bind to this project",
    )
    create.add_argument(
        "--storage-path",
        type=Path,
        default=None,
        help="Override storage directory",
    )

    delete = proj_sub.add_parser("delete", help="Delete a project")
    delete.add_argument("project_id")
    delete.add_argument(
        "--storage-path",
        type=Path,
        default=None,
        help="Override storage directory",
    )

    upload = sub.add_parser("upload", help="Upload files into a project")
    upload.add_argument("--project", required=True, help="Project ID")
    upload.add_argument("path", type=Path, help="File or directory to upload")
    upload.add_argument("--recursive", action="store_true", help="Recurse into directories")
    upload.add_argument(
        "--storage-path",
        type=Path,
        default=None,
        help="Override storage directory",
    )

    # Bridge command
    bridge = sub.add_parser(
        "bridge",
        help="Start local backend bridge for GUI",
        description="Run local API server bridging CLI to Browser GUI",
    )
    bridge.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind (default: 127.0.0.1)",
    )
    bridge.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind (default: 8000)",
    )

    mount = sub.add_parser("mount", help="Manage directory mounts (alias for projects)")
    mount_sub = mount.add_subparsers(dest="mount_cmd", required=True)
    mount_sub.add_parser("list", help="List mounted paths").add_argument(
        "--storage-path", type=Path, default=None, help="Override storage directory"
    )
    mcreate = mount_sub.add_parser("create", help="Mount a local directory")
    mcreate.add_argument("project_id", help="ID for the new mount")
    mcreate.add_argument("mount_path", type=Path, help="Local directory to bind")
    mcreate.add_argument(
        "--storage-path", type=Path, default=None, help="Override storage directory"
    )

    # GUI command (Seamless launcher)
    gui = sub.add_parser(
        "gui",
        help="Launch the Shesha GUI in your browser",
    )
    gui.add_argument(
        "--gui-port",
        type=int,
        default=None,
        help="GUI port (overrides LIBRARIAN_GUI_PORT). Required unless LIBRARIAN_GUI_PORT is set.",
    )
    gui.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Bridge port (default: 8000)",
    )

    return parser


def command_bridge(args: argparse.Namespace) -> None:
    """Run the bridge server."""
    from shesha.bridge.server import run_server

    # Note: SecureConnect #31 - Loopback-only by default
    run_server(host=args.host, port=args.port)


def command_gui(args: argparse.Namespace) -> None:
    """Launch the GUI with a seamless secret token."""
    import webbrowser
    import urllib.request
    import urllib.error

    key = get_or_create_bridge_secret()
    gui_port_raw = (
        args.gui_port
        if getattr(args, "gui_port", None) is not None
        else os.environ.get("LIBRARIAN_GUI_PORT")
    )

    def _looks_like_gui(port: int) -> bool:
        try:
            req = urllib.request.Request(
                f"http://127.0.0.1:{port}/",
                headers={"User-Agent": "librarian/cli"},
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=0.35) as resp:
                body = resp.read(4096).decode("utf-8", errors="replace")
            return "<title>Shesha RLM Operator</title>" in body
        except (urllib.error.URLError, TimeoutError, ValueError):
            return False

    if gui_port_raw:
        gui_port = int(gui_port_raw)
    else:
        # Auto-detect a running GUI dev server to avoid forcing a port setting.
        candidates = [5173, 5174, 5175, 3000, 4173]
        gui_port = next((p for p in candidates if _looks_like_gui(p)), None)
        if gui_port is None:
            print("GUI dev server not detected.", file=sys.stderr)
            print("Start it, then re-run this command:", file=sys.stderr)
            print("  cd gui && npm run dev", file=sys.stderr)
            print("If your port is not auto-detected, set it explicitly:", file=sys.stderr)
            print("  LIBRARIAN_GUI_PORT=<port> librarian gui", file=sys.stderr)
            print("or:", file=sys.stderr)
            print("  librarian gui --gui-port <port>", file=sys.stderr)
            raise SystemExit(2)

    url = f"http://localhost:{gui_port}/?key={key}"

    print(f"🚀 Launching GUI: {url}")
    print("If browser doesn't open, copy and paste the URL above.")
    webbrowser.open(url)


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    cmd = args.cmd

    resolved = resolve_paths()

    if cmd == "install":
        paths = LibrarianPaths(
            home=resolved.home,
            storage=args.storage_path if args.storage_path is not None else resolved.storage,
            logs=args.log_dir if args.log_dir is not None else resolved.logs,
        )
        manifest_dir = (
            args.manifest_dir if args.manifest_dir is not None else _default_manifest_dir()
        )

        print("Installing Librarian (Shesha RLM)…\n")
        print("Planned state + outputs:")
        print(f"  storage:  {paths.storage}")
        print(f"  logs:     {paths.logs}")
        print(f"  manifest: {_manifest_path(manifest_dir)}")
        print(f"  readme:   {_readme_path(manifest_dir)}\n")

        result = run_install(
            paths=paths,
            manifest_dir=manifest_dir,
            skip_docker=bool(args.skip_docker),
            skip_sandbox=bool(args.skip_sandbox),
        )
        if not result.ok:
            print(result.details, file=sys.stderr)
            return 1

        # Record where the operator chose to write the manifest/readme so the GUI bridge
        # can find it even when started from a different working directory.
        try:
            set_manifest_dir(paths, manifest_dir.resolve())
        except PermissionError:
            # In restricted environments this may be blocked. The install can still succeed;
            # the operator can set the manifest dir later via the GUI bridge settings.
            pass
        
        # Ensure bridge secret is generated on install
        get_or_create_bridge_secret(paths)
        
        _print_install_summary(paths=paths, manifest_dir=manifest_dir)
        _offer_path_setup()
        return 0

    if cmd == "mcp":
        from shesha.librarian.mcp import main as mcp_main

        mcp_args = []
        if args.storage_path is not None:
            mcp_args += ["--storage-path", str(args.storage_path)]
        if args.log_dir is not None:
            mcp_args += ["--log-dir", str(args.log_dir)]
        if args.model is not None:
            mcp_args += ["--model", args.model]
        if args.api_key is not None:
            mcp_args += ["--api-key", args.api_key]
        return mcp_main(mcp_args)

    if cmd == "query":
        storage_path = args.storage_path if args.storage_path is not None else resolved.storage
        core = LibrarianCore(storage_path=storage_path, model=args.model, api_key=args.api_key)
        try:
            answer = core.query(args.project, args.question)
        except (RuntimeError, SheshaError, ValidationError, ValueError) as e:
            print(str(e), file=sys.stderr)
            return 2
        print(answer)
        return 0

    if cmd == "projects":
        storage_path = getattr(args, "storage_path", None) or resolved.storage
        core = LibrarianCore(storage_path=storage_path)
        if args.projects_cmd == "list":
            print(json.dumps({"projects": core.list_projects()}, indent=2))
            return 0
        if args.projects_cmd == "create":
            try:
                core.create_project(args.project_id, mount_path=getattr(args, "mount_path", None))
            except (SheshaError, ValidationError, ValueError) as e:
                print(str(e), file=sys.stderr)
                return 2
            print(json.dumps({"status": "created", "project_id": args.project_id}, indent=2))
            return 0
        if args.projects_cmd == "delete":
            try:
                core.delete_project(args.project_id)
            except (SheshaError, ValidationError, ValueError) as e:
                print(str(e), file=sys.stderr)
                return 2
            print(json.dumps({"status": "deleted", "project_id": args.project_id}, indent=2))
            return 0

    if cmd == "mount":
        storage_path = getattr(args, "storage_path", None) or resolved.storage
        core = LibrarianCore(storage_path=storage_path)
        if args.mount_cmd == "list":
            # Show metadata (id + mount_path) for better "Working Code" visibility
            metadata = core.list_projects_metadata()
            print(json.dumps({"mounts": metadata}, indent=2))
            return 0
        if args.mount_cmd == "create":
            try:
                core.create_project(args.project_id, mount_path=args.mount_path)
            except (SheshaError, ValidationError, ValueError) as e:
                print(str(e), file=sys.stderr)
                return 2
            print(json.dumps({
                "status": "mounted", 
                "mount_id": args.project_id, 
                "path": str(args.mount_path)
            }, indent=2))
            return 0

    if cmd == "upload":
        storage_path = args.storage_path if args.storage_path is not None else resolved.storage
        core = LibrarianCore(storage_path=storage_path)
        try:
            uploaded = core.upload(args.project, args.path, recursive=bool(args.recursive))
        except (SheshaError, ValidationError, ValueError) as e:
            print(str(e), file=sys.stderr)
            return 2
        print(json.dumps({"uploaded": uploaded}, indent=2))
        return 0

    if cmd == "bridge":
        command_bridge(args)
        return 0

    if cmd == "gui":
        command_gui(args)
        return 0

    raise RuntimeError(f"Unhandled command: {cmd}")
