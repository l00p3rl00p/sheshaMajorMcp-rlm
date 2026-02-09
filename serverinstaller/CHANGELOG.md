# Changelog

All notable changes to the Shesha Clean Room Installer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-02-09

### Improvements
- **Portable Installer**: Moved installation logic to a standalone `/serverinstaller` directory for easy replication. (#)
- **Headless Mode**: Added `--headless` flag to bypass all interactive prompts and TTY requirements. (#)
- **NPM Policy**: Added `--npm-policy` for selective Node/NPM isolation (local vs global). (#)
- **Surgical Reversal**: Implemented marker-aware shell configuration cleanup in `uninstall.py`. (#)
- **Dynamic Discovery**: Installer now respects "Install-as-is" logic for local source parity. (#)

### Fixes
- **Manifest Tracking**: Fixed manifest generation to accurately track all created artifacts for clean removal. (#)
