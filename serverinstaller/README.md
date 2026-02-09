# Shesha Clean Room Installer

The portable wavefront for Shesha RLM. This directory provides a "Just Works" installation experience for human operators and automated agents, ensuring a clean and isolated environment across any repository fork.

## 🚀 Quick Start (60s)

To install Shesha headlessly (for agents/CI):

```bash
python serverinstaller/install.py --headless
```

To install interactively (with guided walkthrough):

```bash
python serverinstaller/install.py
```

## 🛠 Features

- **Portability**: Copy this folder to any fork/repo. It assumes the project is at `../`.
- **Environment Audit**: Pre-flight scan of PATH, Node, and Docker.
- **Node Isolation**: Optional local Node/NPM installation for a self-contained environment.
- **Before/After Verification**: Transparency through state change reporting.
- **Clean Uninstall**: Complete reversal of all installation artifacts.

## 📖 Documentation

- [USER_OUTCOMES.md](./USER_OUTCOMES.md): Goals and success criteria.
- [ENVIRONMENT.md](./ENVIRONMENT.md): Deep dive into audit logic and policies.
- [ARCHITECTURE.md](./ARCHITECTURE.md): Design of the modular installer.

## ⚙️ Arguments

| Flag | Description |
|---|---|
| `--headless` | Bypass all interactive prompts. |
| `--npm-policy {local,global,auto}` | Control Node/NPM isolation. |
| `--docker-policy {fail,skip}` | Define behavior if Docker is missing. |
| `--storage-path PATH` | Override default storage location. |
| `--log-dir PATH` | Override default log location. |
