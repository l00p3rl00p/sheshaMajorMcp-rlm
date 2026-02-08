# Headless-First Architecture Rule

> **Scope**: Project-specific (sheshaMajorMcp-rlm)
> **Goal**: Ensure Librarian core, bridge, and MCP remain 100% functional without GUI assets.

## Governance Rules

1. **Zero Hard Dependencies**: Core logic (`src/shesha/librarian`) and the Bridge server (`src/shesha/bridge`) MUST NOT require the `gui/` directory or its contents to boot or execute primary functions.
2. **Conditional GUI Serving**: Any GUI-related logic in the Python backend (e.g., serving static files) MUST be gated by existence checks (e.g., `if gui_dist.exists():`). Failure to find GUI assets should result in a graceful fallback (JSON message), never a crash.
3. **Headless CLI Validation**: New CLI commands or features must be verified using the headless test suite (`tests/test_headless.py`) to confirm they don't implicitly depend on a browser or GUI state.
4. **Bridge Port Integrity**: Port 8000 remains the primary API port. Serving GUI assets on this port is an optional convenience, not a requirement for the API's existence.

## Violation Triggers
- Importing any GUI-specific file into the `src/` directory.
- Adding mandatory Python dependencies that are only used for GUI frontend logic.
- Hardcoding `gui/dist` paths without `Path.exists()` checks.
