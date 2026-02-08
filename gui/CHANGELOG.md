# CHANGELOG - Shesha RLM Operator GUI

All notable changes to the Shesha RLM Operator GUI will be documented in this file.

## [0.5.0] - 2026-02-07
### Improvements (#)
- **Production-Ready Bundling**: Switched from CDNs to local assets (JS, CSS, Fonts).
- **Self-Hosted Assets**: Integrated local Inter, JetBrains Mono, and Space Grotesk fonts.
- **Zero-Dependency Runtime**: Removed dependency on external CDNs for Tailwind, React, and Lucide.
- **Bridge Integration**: Standardized on Bridge-hosted serving at port 8000.
- Added comprehensive automated test suite using Vitest/RTL.
- Integrated GUI testing into project-wide `Makefile`.
- Established standard documentation hierarchy (ARCHITECTURE, USER_OUTCOMES, CHANGELOG).

### Fixes (#)
- Implemented `ErrorBoundary` for global UI resilience.
- Added error handling for `FileReader` in `Documentation.tsx` (Audit Finding).
- Documented "Prototype" status in code comments across major screens.

### Patches (#)
- Gated `npm run build` process with `test:ci`.
- Standardized file headers and documentation status.
