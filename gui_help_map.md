# GUI Help Content Map

This document captures the planned content for the comprehensive help screen and the per-screen context help callouts. Each entry describes what the operator should learn, the affected UI elements, and the recommended copy density.

## 1. Help System Goals
* Always expose help: every screen has a “help” button near the global controls.
* Contextual and hover help for key controls (e.g., mount modal fields, health panel actions).
* Over-explain deployment flow: why run each CLI command, what dependency it satisfies.
* Surface blocked features for missing dependencies and offer actions or remediation steps.

## 2. Screen-specific help

### Dashboard
* Purpose: high-level system health and quick jump to diagnostics.
* Callouts:
  * Health tiles: describe each metric (Server, Docker, Manifest) and why it matters.
  * “Health Audit” CTA: explains that it runs live checks and links to auto-retry.
  * Floating “Agents” FAB: describe that it opens the agent center for live observation.

### Mount Manager
* Purpose: map local folders to Librarian projects so queries include file context.
* Callouts:
  * Bridge banner: why the bridge is required, how to paste the key, how to start Docker.
  * “Add Mount” drop zone: mention drag-drop limitation, require absolute path or `~`.
  * Modal fields: explain project_id rules (alphanumeric, max length), mount_path conventions, quick paths.
  * Buttons (Save/Retry/Close): describe actions and expected state changes or refresh.

### Operator Chat
* Purpose: send natural-language queries via the GUI to MCP/bridge.
* Callouts:
  * Project picker: picking mount IDs, indicators for active mounts, difference between chat ID and mount selection.
  * Input bar: explain the query lifecycle (send → bridge → Docker sandbox), mention `/` commands if any.
  * Health callout: highlight Docker dependency and show the “Recheck Health” action; mention saved project IDs.

### Settings
* Purpose: configure PATH bridging and copy commands to OS shell RC files.
* Callouts:
  * PATH snippets: state why adding `.venv/bin` to `PATH` avoids typing `python -m shesha.librarian`.
  * Copy buttons: mention they add `.venv` to `.zshrc/.bashrc` and that user must reload shell.

### HealthPanel Popup
* Purpose: always-visible health audit covering Bridge, Docker, Manifest.
* Callouts:
  * Panel sections: describe what “Blocked Features” map means, cite actions to fix each dependency.
  * Recheck button: mention it reruns the dependency checks without leaving the interface.
  * Close button: ensures the panel can be toggled without losing data.

### Global Help
* For screens without explicit widgets (Dashboard, CLI reference, Capability panels):
  * Provide the same help screen entries as the Help Map so operators can read about each command.
  * Offer CLI guidance: when to run `librarian bridge`, `librarian gui`, `npm run dev`, etc.
  * Clarify differences between MCP commands and GUI operations.

## 3. Visualization best practices
* Use high-contrast panels (dark background, gradient) to denote popups vs. page content.
* Icons/labels (Shield, Alert) make dependency health quickly scannable.
* Structure help content in cards or lists with headings, icons, and micro-copy explaining consequences.
* Emphasize blocked features per dependency (see HealthPanel) and include remediation/command buttons directly in the copy (action-driven help).

## 4. Next steps for implementation (Step 3+)
* Convert each section above into actual UI help components.
* Ensure every interactive control has a tooltip or mini-popover pointing to the relevant help text.
* Wire the new Help screen from the navigation drawer and the Help button in the top-right.
