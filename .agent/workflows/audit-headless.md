---
description: Audit the codebase for headless compliance and verify core functionality.
---

// turbo-all
# Headless Compliance Audit

This workflow ensures that the Librarian core remains functional without the GUI.

1. **Verify State Isolation**
   Run the headless test suite to ensure no GUI dependencies have leaked into core.
```bash
pytest tests/test_headless.py -v
```

2. **Backend Existence Check**
   Verify the Bridge server handles missing GUI assets gracefully.
```bash
# Temporarily rename gui/dist to simulate missing assets
if [ -d "gui/dist" ]; then mv gui/dist gui/dist_bak; fi
# Run bridge briefly to check for boot errors
timeout 3s librarian bridge || true
# Restore gui/dist
if [ -d "gui/dist_bak" ]; then mv gui/dist_bak gui/dist; fi
```

3. **Dependency Scan**
   Check for forbidden imports (any reference to `gui/` inside `src/shesha/librarian` or `src/shesha/bridge`).
```bash
grep -r "gui/" src/shesha/librarian src/shesha/bridge || echo "No illegal GUI dependencies found."
```
