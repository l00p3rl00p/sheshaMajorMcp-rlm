# External Prompts Design

Move LLM prompts to editable markdown files for easier customization and auditing.

## File Structure

```
prompts/
├── README.md          # Documentation for users
├── system.md          # Main RLM system prompt (SYSTEM_PROMPT_TEMPLATE)
├── subcall.md         # Sub-LLM call template (SUBCALL_PROMPT_TEMPLATE)
└── code_required.md   # Follow-up when code block missing
```

Each markdown file contains the raw prompt text with `{placeholder}` variables. No frontmatter or special formatting needed - the entire file content is the prompt.

**README.md** documents:
- Purpose of each prompt file
- Available placeholders per file with descriptions
- How to create alternate prompt directories
- How to validate prompts after editing

**Default location:** `prompts/` bundled with the package (via `package_data` in pyproject.toml).

**Alternate locations:** Users can copy the entire `prompts/` directory, modify it, and point to it via `SHESHA_PROMPTS_DIR` or `--prompts-dir`.

## Prompt Loading

A new module `src/shesha/prompts/loader.py` handles loading and rendering prompts.

```python
# Core interface
class PromptLoader:
    def __init__(self, prompts_dir: Path | None = None):
        """Load prompts from directory. Uses default if not specified."""

    def render_system_prompt(self, doc_count: int, total_chars: int,
                             doc_sizes_list: str, max_subcall_chars: int) -> str:
        """Load and render system.md with variables."""

    def render_subcall_prompt(self, instruction: str, content: str) -> str:
        """Load and render subcall.md with variables."""

    def render_code_required(self) -> str:
        """Load code_required.md (no variables)."""
```

**Directory resolution order:**
1. Explicit `prompts_dir` argument (from CLI `--prompts-dir`)
2. `SHESHA_PROMPTS_DIR` environment variable
3. Default bundled `prompts/` directory in package

**Caching:** Prompts are read from disk once at initialization, not on every render. Users must restart to pick up changes (no hot-reload complexity).

**Integration:** The existing `build_system_prompt()` and `build_subcall_prompt()` functions in `prompts.py` will be replaced by `PromptLoader` methods. The `engine.py` will instantiate a `PromptLoader` and use it.

## Validation System

A new module `src/shesha/prompts/validator.py` handles prompt validation.

**Each prompt has a defined schema:**
```python
PROMPT_SCHEMAS = {
    "system.md": {
        "required": {"doc_count", "total_chars", "doc_sizes_list", "max_subcall_chars"},
        "optional": set(),
    },
    "subcall.md": {
        "required": {"instruction", "content"},
        "optional": set(),
    },
    "code_required.md": {
        "required": set(),
        "optional": set(),
    },
}
```

**Validation checks:**
1. All required files exist
2. All required placeholders present in each file
3. No unknown placeholders (catches typos like `{doc_countt}`)
4. Balanced braces (catches `{doc_count` without closing brace)

**When validation runs:**
- At `PromptLoader` initialization (startup)
- Via `python -m shesha.prompts.validate [--prompts-dir /path]`

**CLI validator output:**
```
$ python -m shesha.prompts.validate --prompts-dir ./my-prompts
Validating prompts in ./my-prompts...
✓ system.md - OK
✗ subcall.md - Missing required: {instruction}
✗ code_required.md - Unknown placeholder: {foo}
Validation failed: 2 errors
```

## Error Messages

Clear, actionable error messages when validation fails.

**Missing required placeholder:**
```
PromptValidationError: prompts/system.md is missing required placeholder: {doc_count}

This placeholder is needed for: document count shown to the LLM
To fix: Add {doc_count} somewhere in the prompt text
```

**Unknown placeholder:**
```
PromptValidationError: prompts/subcall.md contains unknown placeholder: {contnet}

Available placeholders for this file: {instruction}, {content}
Did you mean: {content}?
```

**Missing file:**
```
PromptValidationError: Required prompt file not found: prompts/system.md

Expected files: system.md, subcall.md, code_required.md
Prompts directory: /path/to/prompts
```

**Unbalanced braces:**
```
PromptValidationError: prompts/system.md has unbalanced braces near line 15

Found '{doc_count' without closing brace
```

**At startup:** These errors are raised as exceptions, halting execution with a clear message.

**Via CLI:** Same messages but formatted for terminal output with exit code 1 on failure.

## README.md for Users

The `prompts/README.md` documents the prompt system for users who want to customize.

**Contents:**

1. **Overview** - What each prompt file does and when it's used
2. **Placeholder reference** - Table of all placeholders per file:
   | File | Placeholder | Description |
   |------|-------------|-------------|
   | system.md | `{doc_count}` | Number of documents loaded |
   | system.md | `{total_chars}` | Total characters across all documents |
   | system.md | `{doc_sizes_list}` | Formatted list of document names and sizes |
   | system.md | `{max_subcall_chars}` | Character limit for sub-LLM calls |
   | subcall.md | `{instruction}` | User's analysis instruction |
   | subcall.md | `{content}` | Document content being analyzed |

3. **Creating custom prompt sets** - How to copy and modify prompts for different use cases
4. **Validation** - How to run `python -m shesha.prompts.validate` after editing
5. **Environment variable** - How to set `SHESHA_PROMPTS_DIR`

## Code Changes Summary

**New files:**
- `src/shesha/prompts/__init__.py` - Package init, exports `PromptLoader`
- `src/shesha/prompts/loader.py` - `PromptLoader` class
- `src/shesha/prompts/validator.py` - Validation logic and schemas
- `src/shesha/prompts/__main__.py` - CLI entry point for `python -m shesha.prompts.validate`
- `prompts/system.md` - System prompt (extracted from current `SYSTEM_PROMPT_TEMPLATE`)
- `prompts/subcall.md` - Subcall prompt (extracted from current `SUBCALL_PROMPT_TEMPLATE`)
- `prompts/code_required.md` - Code block requirement message
- `prompts/README.md` - User documentation

**Modified files:**
- `src/shesha/rlm/engine.py` - Use `PromptLoader` instead of `build_system_prompt()` / `build_subcall_prompt()`
- `src/shesha/rlm/prompts.py` - Remove templates, keep `wrap_repl_output()` (it's not a user-editable prompt)
- `pyproject.toml` - Add `prompts/` to package data

**Removed:**
- `SYSTEM_PROMPT_TEMPLATE` and `SUBCALL_PROMPT_TEMPLATE` constants from `prompts.py`
- `build_system_prompt()` and `build_subcall_prompt()` functions
