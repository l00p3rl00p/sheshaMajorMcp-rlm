# CHANGELOG - Shesha RLM Operator GUI

All notable changes to the Shesha RLM Operator GUI will be documented in this file.

## [Unreleased]
### Improvements (#)
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
