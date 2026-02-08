# Shesha RLM Operator GUI (Optional)

This folder contains a browser-based operator GUI that layers over the Shesha Librarian CLI and MCP server. It is optional, local-first, and does not replace the CLI.

## Why Browser-Based
- Cross-platform (Mac + Windows) with zero native packaging.
- Lowest friction for operators.
- Works alongside the existing CLI/MCP workflows.

## Run Locally (Production)
The GUI is built into production assets and served directly by the Shesha Bridge on port 8000.

1. Start the Bridge:
   `librarian bridge`
2. Launch the GUI:
   `librarian gui`

## Development Workflow
If you want to modify the GUI code and see changes in real-time:

Prerequisites: Node.js (LTS).

1. Install dependencies:
   `npm install`
2. Start the Vite dev server:
   `npm run dev`
3. Build for production:
   `npm run build` (Assets are output to `dist/` and served by the Bridge).

## Testing
The GUI includes a comprehensive test suite using Vitest and React Testing Library.

- Run all tests: `npm test`
- Run tests in CI mode (single run): `npm run test:ci`
- Note: GUI builds are gated by tests (`npm run build` executes `test:ci` first).

The GUI is fully wired to the local Bridge API.

## Canonical CLI Commands
Use the CLI for actual operations:

```bash
librarian install
librarian mcp
librarian query --project <id> "question"
librarian projects list
librarian projects create <id>
librarian projects delete <id>
librarian upload --project <id> <path> --recursive
```

If `librarian` is not on PATH, use:

```bash
python -m shesha.librarian <command>
```

## Notes
- Storage, logs, and manifest locations resolve from `LIBRARIAN_HOME`, `LIBRARIAN_STORAGE_PATH`, and `LIBRARIAN_LOG_DIR`.
- Project queries require Docker and `SHESHA_API_KEY` to be configured in the CLI environment.
