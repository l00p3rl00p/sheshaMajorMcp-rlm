import os
from dataclasses import asdict
import sys
import argparse
import json
import subprocess
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Any

# Ensure we can import from the same directory
sys.path.append(str(Path(__file__).parent))
from audit import EnvironmentAuditor

class SheshaInstaller:
    def __init__(self, args: argparse.Namespace):
        self.args = args
        self.portable_root = Path(__file__).parent.resolve()
        self.project_root = self.portable_root.parent.resolve()
        self.auditor = EnvironmentAuditor(self.project_root)
        self.artifacts = []

    def log(self, msg: str):
        if not self.args.headless:
            print(f"[*] {msg}")

    def error(self, msg: str):
        print(f"[!] ERROR: {msg}", file=sys.stderr)
        sys.exit(1)

    def discover_project(self) -> Dict[str, Any]:
        """Scan the project root to see what application files are present."""
        self.log(f"Scanning project root: {self.project_root}")
        
        discovery = {
            "python_project": (self.project_root / "pyproject.toml").exists(),
            "npm_project": (self.project_root / "package.json").exists(),
            "gui_project": (self.project_root / "gui" / "package.json").exists(),
            "docker_project": (self.project_root / "Dockerfile").exists() or 
                             (self.project_root / "src" / "shesha" / "sandbox" / "Dockerfile").exists(),
        }
        
        self.log(f"Discovered: {', '.join([k for k, v in discovery.items() if v])}")
        return discovery

    def setup_venv(self):
        """Ensure we are in or create a virtual environment."""
        if sys.prefix != sys.base_prefix:
            self.log("Already running in a virtual environment.")
            return

        venv_path = self.project_root / ".venv"
        if not venv_path.exists():
            self.log(f"Creating virtual environment at {venv_path}...")
            subprocess.run([sys.executable, "-m", "venv", str(venv_path)], check=True)
            self.artifacts.append(str(venv_path))
        
        self.log(f"Virtual environment ready. Please activate it before continuing.")
        if not self.args.headless:
            self.log(f"Command: source {venv_path}/bin/activate")

    def install_python_deps(self, discovery: Dict[str, Any]):
        if discovery["python_project"]:
            self.log("Installing Python dependencies (local source)...")
            cmd = [sys.executable, "-m", "pip", "install", "-e", "."]
            if discovery["npm_project"]:
                cmd = [sys.executable, "-m", "pip", "install", "-e", ".[dev]"]
            try:
                subprocess.run(cmd, cwd=self.project_root, check=True, capture_output=True, text=True)
            except subprocess.CalledProcessError as e:
                self.log(f"Warning: pip install failed. This is expected if external dependencies are missing or Python version is incompatible.")
                self.log(f"Error: {e.stderr}")

    def setup_npm(self, discovery: Dict[str, Any]):
        if not discovery["gui_project"]:
            return

        policy = self.args.npm_policy
        gui_path = self.project_root / "gui"
        
        if policy == "local":
            self.log("NPM Policy: Local isolation. (Note: implementation would use nodeenv here)")
            # Stub for nodeenv logic if available
        
        self.log(f"Running npm install in {gui_path}...")
        try:
            subprocess.run(["npm", "install"], cwd=gui_path, check=True)
            self.artifacts.append(str(gui_path / "node_modules"))
        except Exception as e:
            self.log(f"Warning: npm install failed: {e}")

    def write_manifest(self, audit: Dict[str, Any]):
        manifest_dir = self.project_root / ".librarian"
        manifest_dir.mkdir(parents=True, exist_ok=True)
        manifest_path = manifest_dir / "manifest.json"
        
        manifest_data = {
            "install_date": audit["timestamp"],
            "install_artifacts": self.artifacts,
            "audit_snapshot": audit,
            "version": "0.5.0-portable"
        }
        
        with open(manifest_path, 'w') as f:
            json.dump(manifest_data, f, indent=2)
        
        self.log(f"Installation manifest written to {manifest_path}")

    def setup_path(self, audit: Dict[str, Any]):
        """Offer to add Shesha to PATH with markers for surgical reversal."""
        if self.args.headless:
            return

        shell = audit.get("shell", "")
        rc_file = None
        if "zsh" in shell:
            rc_file = Path.home() / ".zshrc"
        elif "bash" in shell:
            rc_file = Path.home() / ".bashrc"

        if not rc_file or not rc_file.exists():
            return

        venv_bin = self.project_root / ".venv" / "bin"
        if sys.platform.startswith("win"):
            venv_bin = self.project_root / ".venv" / "Scripts"
        
        export_line = f'export PATH="{venv_bin.resolve()}:$PATH"'
        
        self.log(f"\nOptional: add Shesha to PATH so 'librarian' is available everywhere.")
        self.log(f"  This will modify: {rc_file}")
        self.log(f"  (Markers # Shesha Block START/END will be used for safe reversal)")
        
        choice = input("Add to PATH? [y/N]: ").strip().lower()
        if choice != "y":
            return

        marker_start = "# Shesha Block START"
        marker_end = "# Shesha Block END"
        
        block = f"\n{marker_start}\n{export_line}\n{marker_end}\n"
        
        with rc_file.open("a", encoding="utf-8") as handle:
            handle.write(block)
        
        self.artifacts.append(str(rc_file)) # Track that we modified this file
        self.log(f"Added to PATH in {rc_file}")

    def run(self):
        if not self.args.headless and not sys.stdin.isatty():
            self.error("Interactive mode requires a TTY. Use --headless for automated install.")

        audit = self.auditor.audit()
        
        # Hard requirement check
        py_major, py_minor = map(int, audit.python_version.split('.'))
        if (py_major, py_minor) < (3, 11):
            self.log(f"WARNING: Python {audit.python_version} detected. Most Shesha/MCP projects require 3.11+.")
            if self.args.docker_policy == "fail":
                self.error("Python version incompatible.")

        discovery = self.discover_project()
        
        # Component Selection
        install_choices = {
            "python": discovery["python_project"],
            "gui": discovery["gui_project"] and not self.args.no_gui,
        }
        
        if not self.args.headless:
            print("\n" + "="*40)
            print("COMPONENT INVENTORY".center(40))
            print("="*40)
            
            if discovery["python_project"]:
                choice = input("Install Python Server/CLI? [Y/n]: ").strip().lower()
                install_choices["python"] = choice != 'n'
            
            if discovery["gui_project"]:
                choice = input("Install GUI Frontend? [Y/n]: ").strip().lower()
                install_choices["gui"] = choice != 'n'
            
            print("="*40 + "\n")

        if install_choices["python"]:
            self.setup_venv()
            self.install_python_deps(discovery)
        
        if install_choices["gui"]:
            self.setup_npm(discovery)
        
        audit_dict = asdict(audit) if hasattr(audit, '__dict__') else audit
        if install_choices["python"]:
            self.setup_path(audit_dict)
        
        self.write_manifest(audit_dict)
        self.log("Installation complete.")

def main():
    parser = argparse.ArgumentParser(description="Shesha Clean Room Installer")
    parser.add_argument("--headless", action="store_true", help="Non-interactive install")
    parser.add_argument("--no-gui", action="store_true", help="Skip GUI installation")
    parser.add_argument("--npm-policy", choices=["local", "global", "auto"], default="auto")
    parser.add_argument("--docker-policy", choices=["fail", "skip"], default="skip")
    parser.add_argument("--storage-path", type=Path)
    parser.add_argument("--log-dir", type=Path)
    
    args = parser.parse_args()
    
    # Manual helper for asdict if needed
    from audit import AuditResult
    import dataclasses
    
    installer = SheshaInstaller(args)
    installer.run()

if __name__ == "__main__":
    main()
