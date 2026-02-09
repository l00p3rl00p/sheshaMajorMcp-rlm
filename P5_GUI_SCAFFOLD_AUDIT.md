# P5: GUI Scaffold Audit Report

**Date**: 2026-02-07  
**Status**: ✅ Complete

---

## Summary

Audited the GUI to ensure it functions as a **scaffold over the CLI** with no business logic duplication.

---

## Audit Results

### ✅ Compliant Components

| Component | Status | Notes |
|-----------|--------|-------|
| `BridgeClient` | ✅ | All calls proxy to backend |
| `Dashboard.tsx` | ✅ | Health from `/api/health` |
| `Persistence.tsx` | ✅ | Manifest from `/api/manifest` |
| `MessageMonitor.tsx` | ✅ | Events from BridgeClient |

### 🔧 Fixed Issues

| Component | Issue | Resolution |
|-----------|-------|------------|
| `AgentConfig.tsx` | Was prototype with fake buttons | Wired to `/api/capabilities` to display real CLI tools |

---

## GUI-Only Settings

All stored in `localStorage` (browser-only, not in CLI config):

| Key | Purpose |
|-----|---------|
| `shesha_bridge_key` | Bridge auth token |
| `shesha_manifest_prompt_dismissed` | UI dismissal state |
| `shesha_chat_project` | Last selected chat project |
| `shesha_chat_projects` | Chat project list cache |

---

## Headless Validation

Added `tests/test_headless.py` with:
- `test_install_command_runs_headless`
- `test_mcp_help_runs_headless`
- `test_projects_list_help_runs_headless`
- `test_query_help_runs_headless`
- `test_core_imports_without_gui`
- `test_gui_not_required_for_startup`

**Run with:**
```bash
pytest tests/test_headless.py -v
```

---

## Changes Made

1. **Backend**: Added `/api/capabilities` endpoint to `endpoints.py`
2. **Frontend**: Added `getCapabilities()` to `BridgeClient`
3. **AgentConfig**: Rewritten to display read-only CLI tool definitions
4. **Tests**: Added `test_headless.py` for headless validation
