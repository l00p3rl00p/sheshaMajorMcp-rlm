# User Outcomes: Clean & Portable Installer

The goal of the `/serverinstaller` is to provide a "Just Works" experience for human operators and automated agents, ensuring a clean and isolated environment across any repository fork.

## Successful Outcomes

- [ ] **Portability**: The `/serverinstaller` directory can be copied to any fork/repo and execute correctly without external dependencies.
- [ ] **Clean Environment**: The installer accurately audits the system (PATH, Node, Shell) and guarantees isolation (local Node/NPM option).
- [ ] **Trust & Visibility**: Users receive a "Before/After" verification report showing exactly what changed on their system.
- [ ] **Agentic Replication**: Agents can run the installer headlessly without any interactive prompts or TTY requirements.
- [ ] **Safe Reversal**: The `uninstall` command cleanly removes all tracked artifacts, restoring the system to its pre-installation state.
- [ ] **Local Source Parity**: The installer installs the application *exactly as it exists* in the local root directory, respecting all custom modifications.
