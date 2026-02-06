# Wishlist: Full Backend Execution With Confirmation Gates

**A roadmap for implementing a hybrid GUI with local backend bridge and explicit confirmation gates for command execution.**

This feature adds live data access (manifest, logs, projects) and one-click actions while preserving CLI-first behavior and requiring explicit user approval for all operations.

---

## ⚡ Quick Overview

**Goal**: Provide live data and optional one-click actions with safe, explicit approvals while maintaining CLI-first principles.

**Key Components**:
1. Local backend bridge on `localhost`
2. Read-only endpoints for status/data
3. Command execution with multi-gate confirmation
4. UI with explicit preview and approval flow

---

## 📋 Table of Contents

1. [Implementation Options](#implementation-options)
2. [Execution Plan](#execution-plan)
3. [Backend Responsibilities](#backend-responsibilities)
4. [Confirmation Gate Rules](#confirmation-gate-rules)
5. [Allowed Commands](#allowed-commands)
6. [UI Changes](#ui-changes)
7. [Security Notes](#security-notes)
8. [Non-Goals](#non-goals)
9. [Functional Ingestion UI Plan](#functional-ingestion-ui-plan)

---

## Implementation Options

### Option B: Local Backend Bridge (Recommended)

**Pros:**
* Live manifest/logs/projects list
* One-click actions with confirmation gates
* Docker state detection with degraded mode display

**Cons:**
* Adds a local service (more moving parts)
* May introduce new CLI behavior if `librarian gui` command added
* Security/permission considerations for running commands

---

## Execution Plan

1. **Add Local Backend Server**
   * Runs on `localhost` only
   * No external network access

2. **Implement Read-Only Endpoints**
   * Health checks
   * Manifest reading
   * Log streaming

3. **Implement Command Execution Endpoints**
   * Prepare/confirm/cancel flow
   * Token-based confirmation

4. **Update GUI**
   * Backend connection toggle
   * Command preview display
   * Confirmation modals

---

## Backend Responsibilities

### Read-Only Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Docker availability and basic status (mirrors `librarian mcp` tool `health`) |
| `/manifest` | GET | Read `.librarian/manifest.json` if present |
| `/projects` | GET | Shell out to `librarian projects list` and return parsed JSON |
| `/logs` | GET | Stream recent log lines from `$LIBRARIAN_LOG_DIR` |

### Command Execution Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/actions/prepare` | POST | Accept command intent, return summarized plan |
| `/actions/confirm` | POST | Execute exact command from prepared plan only |
| `/actions/cancel` | POST | Clear the prepared plan |

---

## Confirmation Gate Rules

**Critical safety requirements for command execution:**

1. **Mandatory Preparation**: Every command must pass through `prepare` before `confirm`
2. **One-Time Tokens**: `confirm` must include a unique token returned by `prepare`
3. **Token Expiration**: Tokens expire quickly (example: 60 seconds)
4. **Immutable Commands**: Commands are frozen after `prepare` (no parameter changes during `confirm`)
5. **High-Risk Confirmation**: High-risk commands require a second confirmation prompt in the UI

---

## Allowed Commands

**Initial command whitelist:**

1. `librarian install` with explicit flags
2. `librarian projects list`
3. `librarian projects create <id>`
4. `librarian projects delete <id>`
5. `librarian upload --project <id> <path> --recursive`
6. `librarian query --project <id> "question"`

---

## UI Changes

**Required interface updates:**

1. **Connection Toggle**
   * `Connect` button to enable backend bridge
   * Visual indicator of connection status

2. **Command Preview Card**
   * Display full CLI command string before execution
   * Syntax highlighting for readability

3. **Confirmation Modal**
   * Countdown timer
   * Explicit accept/cancel buttons
   * Command details display

4. **Live Status Badges**
   * Pull data from `/health` endpoint
   * Show Docker state, manifest status, etc.

---

## Security Notes

**Safety measures:**

1. **Local-Only Access**: Backend runs only on `localhost`
2. **Explicit Confirmation**: No automatic execution without operator approval
3. **Command Transparency**: GUI displays exact command string before execution
4. **Audit Trail**: Log every executed command to local audit file

---

## Non-Goals

**What this feature will NOT do:**

1. ❌ Replace the CLI
2. ❌ Invent new behavior beyond existing CLI and MCP tools
3. ❌ Persist secrets in the GUI

---

## Functional Ingestion UI Plan

### Implementation Matrix

#### 1. Bridge Required CLI Behavior

* Implement backend bridge endpoints for `librarian upload`
* Add `projects list/create` for target selection
* Include explicit confirmation gates

#### 2. UI Wiring

* Connect ingestion screen to bridge
* Real file picker implementation
* Project selector component
* Recursive toggle bound to CLI flags

#### 3. Validation + Preview

* Run preflight check to validate file types
* Verify against supported parsers
* Show preview before execution

#### 4. Execution + Feedback

* Execute upload via bridge
* Stream progress to UI
* Surface success/error states clearly

#### 5. Audit + Recovery

* Log each ingestion command
* Provide retry guidance on failure
* Offer rollback options where applicable

---

**Status**: Wishlist / Planning Phase  
**Last Updated**: 2024-02-06
