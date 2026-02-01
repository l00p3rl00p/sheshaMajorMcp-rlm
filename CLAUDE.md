# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shesha is a Python library implementing Recursive Language Models (RLMs) based on arXiv:2512.24601v1. It enables querying document collections by having an LLM write Python code to explore documents in a REPL, with recursive sub-LLM calls for divide-and-conquer strategies.

**Core concept:** Documents are loaded as variables in a sandboxed Python REPL. The LLM generates code to explore them, sees output, and repeats until calling `FINAL("answer")`.

## Architecture

```
User Query → RLM Core Loop → Docker Sandbox (code execution)
                ↓                    ↓
           LiteLLM Client      llm_query() for sub-calls
                ↓
         Trace Recorder (full observability)
```

**Key components:**
- `src/shesha/rlm/` - Core REPL+LLM loop, terminates on FINAL() or FINAL_VAR()
- `src/shesha/sandbox/` - Docker container pool with warm containers, network-isolated
- `src/shesha/storage/` - Pluggable backend (filesystem default)
- `src/shesha/parser/` - Document extraction (PDF, Word, HTML, code, text)
- `src/shesha/llm/` - LiteLLM wrapper for 100+ providers

**Security model:** Sub-LLM calls use `llm_query(instruction, content)` where instruction is trusted (from root LLM) and content is untrusted (wrapped in `<untrusted_document_content>` tags). Containers have egress whitelist (LLM APIs only).

## Commands

```bash
# Install dependencies
pip install -e ".[dev]"

# Run all tests
pytest

# Run single test
pytest tests/path/to/test.py::test_name -v

# Type checking
mypy src/shesha

# Linting
ruff check src tests
ruff format src tests

# Build sandbox container
docker build -t shesha-sandbox -f src/shesha/sandbox/Dockerfile .

# Makefile shortcuts
make install    # Install with dev dependencies
make test       # Run tests
make lint       # Run linter
make typecheck  # Run mypy
make format     # Format code and fix lints
make all        # Format, lint, typecheck, test
```

## Development Workflow: MANDATORY TDD

**ALL CODE IN THIS PROJECT MUST USE TEST-DRIVEN DEVELOPMENT (TDD).**

This is not optional. This is not a suggestion. Unless technically infeasible (e.g., exploratory spikes, config files), every piece of code follows the red/green/refactor cycle:

### The TDD Cycle (Red → Green → Refactor)

1. **RED: Write a failing test FIRST**
   - Write the test before ANY implementation code
   - Run the test and confirm it fails
   - The failure message should be meaningful (e.g., "ModuleNotFoundError" or assertion failure)

2. **GREEN: Write MINIMAL code to pass**
   - Implement only what's needed to make the test pass
   - No extra features, no "while I'm here" additions
   - Run the test and confirm it passes

3. **REFACTOR: Clean up (if needed)**
   - Improve code structure while keeping tests green
   - Run tests after each refactoring step

4. **COMMIT: After each green state**
   - Commit frequently with descriptive messages
   - Each commit should have passing tests

### TDD Violations to Avoid

- Writing implementation before tests
- Writing tests after implementation ("test-after" is not TDD)
- Skipping the red phase (test must fail first)
- Writing more implementation than needed to pass current tests
- Adding untested code "because it's simple"

### When TDD May Not Apply

- Configuration files (pyproject.toml, Dockerfile, etc.)
- Documentation
- Exploratory spikes (must be discarded or properly TDD'd before merge)

## Key Design Decisions

- **Sub-LLM depth = 1:** Sub-calls are plain LLM (not recursive RLM) for predictable cost
- **Max iterations = 20:** Configurable limit on REPL loop cycles
- **Container pool:** Pre-warmed containers (default 3) to reduce latency
- **Projects:** Documents organized into projects for clean separation
