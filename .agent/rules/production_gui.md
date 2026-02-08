# Production-Ready GUI Rule

> **Scope**: Project-specific (sheshaMajorMcp-rlm)
> **Goal**: Ensure the GUI is fully self-contained, production-ready, and fully functional with zero external runtime dependencies.

## Governance Rules

1. **Zero External Runtime Dependencies**: The GUI MUST NOT depend on any external CDNs, APIs, or services at runtime. All assets (CSS, JS, fonts, icons) must be bundled locally in `gui/dist`.

2. **Offline-First**: The GUI must function completely offline. If the internet is unavailable, the GUI must still load and operate normally.

3. **Proper Build Pipeline**: All GUI work must target the production build (`npm run build`). Development conveniences (like CDN Tailwind) are acceptable only if they're replaced by proper bundling in production.

4. **Self-Hosted Assets**: Fonts, icons, and all visual assets must be self-hosted. No reliance on Google Fonts, Font Awesome CDNs, or similar external services.

5. **Strict CSP Compliance**: The Bridge's Content Security Policy must enforce that all resources load from `'self'` only (except for explicitly documented exceptions with strong justification).

6. **No Mock Screens or Placeholders**: Every GUI screen, component, and feature MUST be fully functional. Mock screens, placeholder data, or "coming soon" stubs are prohibited. If a feature is visible in the GUI, it must work end-to-end.

## Definition of Done for GUI Work

A GUI feature is considered "done" when:
- ✅ It is fully wired to the backend API (no mock data)
- ✅ All user interactions produce real, observable effects
- ✅ Error states are handled gracefully with user-facing messages
- ✅ The feature works in the production build (`npm run build`)
- ✅ No console errors or CSP violations occur
- ✅ The feature functions correctly when served through the Bridge on port 8000

**Mock screens, prototype buttons, or non-functional UI elements are NOT acceptable in production.**

## Violation Triggers
- Adding `<script src="https://...">` or `<link href="https://...">` tags that load runtime dependencies
- Using importmaps that point to external ESM CDNs
- Relying on external APIs for core GUI functionality (styling, rendering, routing)
- Skipping the build step and serving source files directly in production
- Creating UI elements that don't perform their stated function
- Using placeholder or hardcoded data instead of live API calls
