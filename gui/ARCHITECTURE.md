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

### 2. Production Serving Mechanics
The GUI is served by the Python Bridge server using standard static file serving logic:
- **Build Output**: Vite bundles all assets into `gui/dist/`.
- **Bridge Endpoint**: The Python server maps `gui/dist` to the root route `/`.
- **Single Port**: Both API (`/api/*`) and GUI assets are served on port `8000`.

### 3. Asset Self-Hosting & Offline Integrity
To ensure production stability and zero external runtime dependencies:
- **Fonts**: Inter, JetBrains Mono, and Space Grotesk are bundled locally in `gui/public/fonts/`.
- **Tailwind**: Compiled locally into a single CSS file via PostCSS.
- **Strict CSP**: The server enforces a Content Security Policy that restricts all resources to `'self'`.
- **Offline-First**: The application functions 100% offline (excluding optional external avatar APIs).

### 4. Prototypes & Wiring
Screens are progressively wired to real Bridge endpoints.
- **Wired**: Dashboard (Health), Message Monitor (Event Stream), Persistence (Manifest).
- **Static Scaffolding**: Some secondary screens (e.g., Prompt Builder) remain as interactive high-fidelity prototypes.

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
