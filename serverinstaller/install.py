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
            # We install in editable mode to respect the "Install-as-is" requirement
            cmd = [sys.executable, "-m", "pip", "install", "-e", "."]
            if discovery["npm_project"]:
                # If there's a dev flag or similar, we use it
                cmd = [sys.executable, "-m", "pip", "install", "-e", ".[dev]"]
            
            subprocess.run(cmd, cwd=self.project_root, check=True)

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

    def run(self):
        if not self.args.headless and not sys.stdin.isatty():
            self.error("Interactive mode requires a TTY. Use --headless for automated install.")

        audit = self.auditor.audit()
        discovery = self.discover_project()

        self.setup_venv()
        self.install_python_deps(discovery)
        self.setup_npm(discovery)
        
        self.write_manifest(asdict(audit) if hasattr(audit, '__dict__') else audit)
        self.log("Installation complete.")

def main():
    parser = argparse.ArgumentParser(description="Shesha Clean Room Installer")
    parser.add_argument("--headless", action="store_true", help="Non-interactive install")
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
