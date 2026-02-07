# GUI Startup

This GUI is optional and lives in `/Users/almowplay/Developer/Github/sheshaMajorMcp-rlm/gui`.

## Run Locally
Prerequisites: Node.js (LTS).

```bash
cd /Users/almowplay/Developer/Github/sheshaMajorMcp-rlm/gui
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:3000`).

For overall project context and CLI setup, see the root `README.md` (in the `/gui` folder).

> **Installed Users**: If you already ran `python -m shesha.librarian install`, keep Docker running and start the bridge + GUI via:
>
> ```bash
> librarian bridge
> librarian gui
> ```

## Health-aware Startup Checklist

1. Ensure Docker (Desktop, Colima, or Podman) is running before launching the bridge or GUI.
2. Start the bridge so the GUI has an API to talk to:

   ```bash
   cd /Users/almowplay/Developer/Github/sheshaMajorMcp-rlm
   python -m shesha.librarian bridge
   ```

3. Launch the GUI (default port 3000; respects `LIBRARIAN_GUI_PORT`):

   ```bash
   python -m shesha.librarian gui
   ```

   The health panel in the GUI shows bridge, Docker, and manifest status at all times; use the “Recheck Health” button when dependencies change.

4. If you prefer running Vite manually, open a second terminal inside `gui/`, install dependencies, and `npm run dev`; this is optional but helpful for local UI edits.
