# ARCHITECTURE - Shesha RLM Operator GUI

## Tech Stack
- **Framework**: React 19 (Vite-powered)
- **Styling**: Tailwind CSS (UI/UX logic via `index.css`)
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + jsdom
- **Runtime**: Browser-based (Localhost)

## Documentation Hierarchy
- **README.md**: Setup and operation scripts.
- **USER_OUTCOMES.md**: Mission, success signals, and design guardrails.
- **ARCHITECTURE.md**: Technical truth and developer workflow (this file).
- **CHANGELOG.md**: Version history and patch summaries.

## Core Mechanics
### 1. Unified Routing (`App.tsx`)
The application uses a state-driven screen switcher (`currentScreen`). This allows for rapid refinement of "Reframed" versions (Standard vs. Debug vs. Operator) without complex routing overhead.

### 2. Prototype Strategy
Many screens (e.g., `OperatorChat`, `AgentCenter`) are high-fidelity prototypes that use hardcoded data to demonstrate intended behavior. 
- **Live Data Path**: Intended to be wired via an optional Local Backend Bridge (see `Wishlist.md`).
- **Static Scaffolding**: All screens must remain functional as static assets even without the backend.

### 3. Error Handling & Resilience
- **Error Boundaries**: Wrapped around the main screen renderer in `App.tsx` (implemented in `Shared.tsx`).
- **FileReader Guards**: `Documentation.tsx` includes explicit error catching for local file uploads.

## Developer Workflow
- **Build**: `npm run build` (Gated by tests)
- **Test**: `npm test` or `npm run test:ci`
- **Lint**: Integrated into the root Makefile (`make lint`)
- **Add Screen**:
  1. Define name in `types.ts`.
  2. Implement in `screens/`.
  3. Map in `App.tsx` and `BottomNav` in `Shared.tsx`.

## Security Constraints
- **Zero Secrets**: Never hardcode API keys. Use `.env.local` for local development if needed.
- **Sandboxing**: The GUI treats all CLI actions as "Prepared Intents" that require operator confirmation (per Wishlist plan).
