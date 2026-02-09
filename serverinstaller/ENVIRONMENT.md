# Environment: Clean Room Setup

This document outlines the environment audit logic and configuration requirements for the Shesha Clean Room Installer.

## Environment Audit Logic

The installer performs a deep scan of the host environment before taking any action.

### 1. PATH Analysis
- Scans `os.environ['PATH']` for conflicting Node versions or Docker binaries.
- Checks for `.venv/bin` (or equivalent) to determine if we are already in an isolated Python environment.

### 2. Shell Detection
- Identifies the active shell (`zsh`, `bash`, `cmd`, `powershell`).
- Locates relevant configuration files (`.zshrc`, `.bashrc`, etc.) for persistence.

### 3. Dependency Check
- **Node/NPM**: Verifies if `npm` is available globally and checks its version.
- **Docker**: Verifies the Docker socket is accessible.

## Configuration Policies

### NPM Policy (`--npm-policy`)
- `local`: Installs a private `node`/`npm` binary into the virtual environment. Recommended for total isolation.
- `global`: Uses the existing system `npm`.
- `auto`: Scans for global first, and if not present or version-mismatched, recommends `local`.

### Docker Policy (`--docker-policy`)
- `fail`: Exits if Docker is not detected.
- `skip`: Proceeds with installation but disables RLM query features.
