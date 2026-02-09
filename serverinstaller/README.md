# Shesha Clean Room Installer

The portable wavefront for Shesha RLM. This directory provides a "Just Works" installation experience for human operators and automated agents, ensuring a clean and isolated environment across any repository fork.

## 🚀 Quick Start (60s)

To install headlessly (for agents/CI):
```bash
python serverinstaller/install.py --headless
```

To install selectively (guided inventory):
```bash
python serverinstaller/install.py
```

## 🛠 Features

- **Portability**: Standalone directory. Bootstraps from host tools and local workspace.
- **Inventory Awareness**: Scans for Python, Node, and Docker; offers selective installation.
- **Surgical Reversal**: Clean uninstall including marker-aware shell configuration cleanup.
- **Wide compatibility**: Logic hardened for Python 3.9+ environments.

## 📖 Documentation

- [USER_OUTCOMES.md](./USER_OUTCOMES.md): Why we built this and how we measure success.
- [ARCHITECTURE.md](./ARCHITECTURE.md): Technical logic, modular scripts, and developer workflow.
- [ENVIRONMENT.md](./ENVIRONMENT.md): Environment requirements, audit logic, and policies.
- [CHANGELOG.md](./CHANGELOG.md): History of improvements and fixes.

## ⚙️ Key Arguments

| Flag | Description |
|---|---|
| `--headless` | Bypass all interactive prompts (agent mode). |
| `--no-gui` | Skip GUI/NPM installation phase. |
| `--npm-policy {local,global,auto}` | Control Node/NPM isolation. |
| `--docker-policy {skip,fail}` | Define behavior if Docker is missing. |

---
**Status**: Production-ready for agent-driven replication.
