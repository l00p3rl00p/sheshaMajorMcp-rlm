**Wishlist: Full Backend Execution With Confirmation Gates**
This document describes how to implement the hybrid GUI path that adds a local backend bridge with explicit confirmation gates for command execution.

**Goal**
Provide live data (manifest, logs, projects list) and optional one-click actions while preserving CLI-first behavior and safe, explicit approvals.

**Option B: Local Backend Bridge (Optional)**
Pros
- Live manifest/logs/projects list.
- One-click actions with confirmation gates.
- Can detect Docker state and show real degraded modes.
Cons
- Adds a local service (more moving parts).
- Potentially introduces new CLI behavior if we add `librarian gui` or similar.
- Security/permission considerations for running commands.

**Execution Plan**
1. Add a local-only backend server that runs on `localhost`.
2. Implement read-only endpoints first.
3. Implement command execution endpoints with confirmation gates.
4. Update the GUI to call the backend when the operator opts in.

**Backend Responsibilities**
Read-only
- `GET /health` returns Docker availability and basic status (mirrors `librarian mcp` tool `health`).
- `GET /manifest` reads `.librarian/manifest.json` if present.
- `GET /projects` shells out to `librarian projects list` and returns parsed JSON.
- `GET /logs` streams recent log lines from `$LIBRARIAN_LOG_DIR`.

Command execution with gates
- `POST /actions/prepare` accepts a command intent and returns a summarized plan.
- `POST /actions/confirm` executes the exact command from the prepared plan only.
- `POST /actions/cancel` clears the prepared plan.

**Confirmation Gate Rules**
1. Every command must pass through `prepare` before `confirm`.
2. `confirm` must include a one-time token returned by `prepare`.
3. Tokens expire quickly (example: 60 seconds).
4. Commands are immutable after `prepare` (no parameter changes during `confirm`).
5. High-risk commands require a second confirmation prompt in the UI.

**Allowed Commands (Initial)**
1. `librarian install` with explicit flags.
2. `librarian projects list`
3. `librarian projects create <id>`
4. `librarian projects delete <id>`
5. `librarian upload --project <id> <path> --recursive`
6. `librarian query --project <id> "question"`

**UI Changes**
1. Add a `Connect` toggle that enables the backend bridge.
2. Add a command preview card with the full CLI command string.
3. Add a confirmation modal with a countdown and explicit accept/cancel.
4. Display live status badges from `/health`.

**Security Notes**
1. The backend runs only on `localhost`.
2. No automatic execution without explicit operator confirmation.
3. The GUI displays the exact command string before execution.
4. Log any executed command to a local audit file.

**Non-Goals**
1. Do not replace the CLI.
2. Do not invent new behavior beyond existing CLI and MCP tools.
3. Do not persist secrets in the GUI.
