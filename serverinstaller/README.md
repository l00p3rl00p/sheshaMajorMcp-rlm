# Shesha Clean Room Installer

This is the portable, copy-pasteable installer for Shesha RLM. It is designed to bridge the gap between human operators and automated agents by providing a reliable, isolated installation process in any environment.

## 🚀 Quick Start (Headless)

For agents and CI/CD:

```bash
python serverinstaller/install.py --headless
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
