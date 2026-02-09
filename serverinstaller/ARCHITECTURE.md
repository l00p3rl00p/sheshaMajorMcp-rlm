# Architecture: Portable Clean Room Installer

The Shesha Clean Room Installer is designed to be a self-contained, copy-pasteable directory that can bootstrap Shesha in any repository fork.

## Modular Components

### 1. `audit.py` (Registry & Probe)
- Responsible for non-destructive system probing.
- Returns a structured `AuditResult` object.
- Functions as the "eyes" of the installer.

### 2. `install.py` (Orchestrator)
- Uses `audit.py` to decide the best installation path.
- Handles:
    - Virtual environment creation/verification.
    - Python dependency installation (pip).
    - NPM policy enforcement (local vs global).
    - State persistence (`manifest.json`).

### 3. `verify.py` (Reporter)
- Compares post-install state with the pre-install audit.
- Generates the "Before and After" verification report.

### 3. State Management (`manifest.json`)
- **Registry**: Every file or directory created is logged in `.librarian/manifest.json`.
- **Integrity**: Used by `uninstall.py` to ensure zero file-leak cleanup.

## Constraints & Security

- **Relative Root**: The installer assumes the project root is at `../`.
- **Zero-Dependency Bootstrap**: The core scripts use standard library modules where possible (e.g., `subprocess`, `pathlib`, `json`).
- **Idempotency**: All operations are designed to be safe to run multiple times.
