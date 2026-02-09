# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-02-07

### Added
- **Production-Ready GUI**: Fully bundled React app with zero external runtime dependencies.
- **Unified Stack**: Bridge server now serves the GUI directly from `gui/dist`.
- **Self-Hosted Assets**: Downloaded and bundled Inter, JetBrains Mono, and Space Grotesk fonts (offline-capable).
- **Local Tailwind**: Integrated Tailwind v3 into the build pipeline, removing CDN dependency.
- **Smart GUI Launcher**: 10s retry logic in `librarian gui` to allow Bridge startup time.
- **Strict CSP**: Content Security Policy limited to `'self'` for all critical resources.
- Comprehensive automated testing suite for `/gui` using Vitest and React Testing Library.
- GUI testing integration in root `Makefile` (`make gui-test`).
- Global `ErrorBoundary` to `/gui` for increased UI resilience.
- Canonical documentation hierarchy for `/gui` (ARCHITECTURE, USER_OUTCOMES, CHANGELOG).

### Fixed
- Simplified `librarian gui` CLI command by removing obsolete port arguments and env vars.
- Refactored `librarian gui` to verify Bridge health before launching browser.
- Unified API client to use relative URLs when served by Bridge.
- Regression: Converted Docker client context managers to `try/finally` for better platform compatibility and resource cleanup.
- Audit Finding: Added error trapping for `FileReader` operations in the documentation upload screen.
- Standardized documentation status in GUI code comments to clarify prototype vs. production behavior.

## [0.4.0] - 2026-02-05

## [0.4.0] - 2026-02-05

### Added

- Experimental multi-repo PRD analysis (`shesha.experimental.multi_repo`)
  - `MultiRepoAnalyzer` for analyzing how PRDs impact multiple codebases
  - Four-phase workflow: recon, impact, synthesize, align
  - Example script `examples/multi_repo.py`
- `examples/multi_repo.py`: `--prd <path>` argument to read PRD from file
- `examples/multi_repo.py`: interactive repo picker with all-then-deselect across both storage locations
- External prompt files in `prompts/` directory for easier customization
- `python -m shesha.prompts` CLI tool for validating prompt files
- Support for alternate prompt directories via `SHESHA_PROMPTS_DIR` environment variable
- `prompts/README.md` documenting prompt customization
- Session write command (`write` or `write <filename>`) in example scripts (`repo.py`, `barsoom.py`) to save conversation transcripts as markdown files
- Librarian installer + CLI + MCP stdio server (`python -m shesha.librarian ...` / `librarian ...`)
- Local operator manifest output at `.librarian/manifest.json` with last self-test status and resolved state paths
- Default local-first state paths with overrides via `LIBRARIAN_HOME`, `LIBRARIAN_STORAGE_PATH`, and `LIBRARIAN_LOG_DIR`
- Librarian installer auto-builds the `shesha-sandbox` Docker image when missing (for query execution)
- System audit on install with pre-flight checks for Python 3.11+ and virtual environment detection with actionable guidance
- Interactive Docker installation with guided setup and platform-specific instructions when Docker is missing
- Graceful Docker degradation: Shesha initializes successfully without Docker; queries disabled until Docker is available
- Docker status tracking in manifest (`infra.docker_available` field)

### Fixed

- Docker HTTP client resource leak causing "ValueError: I/O operation on closed file" during garbage collection

## [0.3.0] 2026-02-04

### Fixed

- Host memory exhaustion via unbounded container output buffering
- Execution hanging indefinitely when container drips output without newlines
- Oversized JSON messages from container causing memory/CPU spike
- Path traversal in repository ingestion when project_id contains path separators
- Path traversal in raw file storage when document name contains path separators

### Security

- Added protocol limits for container communication (max buffer 10MB, max line 1MB, deadline 5min)
- Applied `safe_path()` consistently to all filesystem operations in repo ingestion and storage

## [0.2.0] - 2026-02-04

### Added

- `Shesha.check_repo_for_updates()` method to check if a cloned repository has updates available
- `RepoIngester.get_repo_url()` method to retrieve the remote origin URL from a cloned repo
- `ProjectInfo` dataclass for project metadata (source URL, is_local, source_exists)
- `Shesha.get_project_info()` method to retrieve project source information
- Repo picker now shows "(missing - /path)" for local repos that no longer exist
- Repo picker supports `d<N>` command to delete projects with confirmation

### Changed

- `Shesha.delete_project()` now accepts `cleanup_repo` parameter (default `True`) to also remove cloned repository data for remote repos

### Fixed

- `--update` flag in `examples/repo.py` now works when selecting an existing project from the picker

## [0.1.0] - 2026-02-03

### Added

- Initial release of Shesha RLM library
- Core RLM loop with configurable max iterations
- Docker sandbox for secure code execution
- Document loading for PDF, DOCX, HTML, and text files
- Sub-LLM queries via `llm_query()` function
- Project-based document organization
- LiteLLM integration for multiple LLM providers
- Trace recording for debugging and analysis
- Security hardening with untrusted content tagging
- Network isolation with egress whitelist for LLM APIs
