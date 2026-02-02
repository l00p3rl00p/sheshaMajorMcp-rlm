# Conversation History Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add session-only conversation history to `examples/barsoom.py` so follow-up questions with pronouns work correctly.

**Architecture:** Store Q&A pairs in a list during interactive sessions. Format history as a prefix prepended to each new question. Warn and offer to clear when history exceeds thresholds.

**Tech Stack:** Python, pytest

---

## Task 1: Add format_history_prefix() Function

**Files:**
- Modify: `examples/barsoom.py` (add function after line 90)
- Test: `tests/examples/test_barsoom.py`

**Step 1: Write the failing test for empty history**

Add to `tests/examples/test_barsoom.py`:

```python
class TestHistoryFormatting:
    """Test conversation history formatting."""

    def test_format_history_prefix_empty(self) -> None:
        """Empty history returns empty string."""
        from examples.barsoom import format_history_prefix

        result = format_history_prefix([])
        assert result == ""
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryFormatting::test_format_history_prefix_empty -v`
Expected: FAIL with "cannot import name 'format_history_prefix'"

**Step 3: Write minimal implementation**

Add to `examples/barsoom.py` after `format_stats()` function (around line 91):

```python
def format_history_prefix(history: list[tuple[str, str]]) -> str:
    """Format conversation history as context for a follow-up question."""
    if not history:
        return ""
    return ""  # Minimal implementation
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryFormatting::test_format_history_prefix_empty -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/barsoom.py tests/examples/test_barsoom.py
git commit -m "feat(barsoom): add format_history_prefix stub"
```

---

## Task 2: Implement Single Exchange Formatting

**Files:**
- Modify: `examples/barsoom.py`
- Test: `tests/examples/test_barsoom.py`

**Step 1: Write the failing test for single exchange**

Add to `TestHistoryFormatting` class:

```python
    def test_format_history_prefix_single_exchange(self) -> None:
        """Single exchange formats correctly."""
        from examples.barsoom import format_history_prefix

        history = [("Who is Dejah Thoris?", "She is the Princess of Helium.")]
        result = format_history_prefix(history)

        assert "Previous conversation:" in result
        assert "Q1: Who is Dejah Thoris?" in result
        assert "A1: She is the Princess of Helium." in result
        assert "Current question:" in result
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryFormatting::test_format_history_prefix_single_exchange -v`
Expected: FAIL with AssertionError

**Step 3: Implement full formatting logic**

Replace the function in `examples/barsoom.py`:

```python
def format_history_prefix(history: list[tuple[str, str]]) -> str:
    """Format conversation history as context for a follow-up question."""
    if not history:
        return ""

    lines = ["Previous conversation:"]
    for i, (q, a) in enumerate(history, 1):
        lines.append(f"Q{i}: {q}")
        lines.append(f"A{i}: {a}")
        lines.append("")  # blank line between exchanges

    lines.append("Current question:")
    return "\n".join(lines)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryFormatting -v`
Expected: PASS (both tests)

**Step 5: Commit**

```bash
git add examples/barsoom.py tests/examples/test_barsoom.py
git commit -m "feat(barsoom): implement format_history_prefix"
```

---

## Task 3: Test Multiple Exchanges Formatting

**Files:**
- Test: `tests/examples/test_barsoom.py`

**Step 1: Write test for multiple exchanges**

Add to `TestHistoryFormatting` class:

```python
    def test_format_history_prefix_multiple_exchanges(self) -> None:
        """Multiple exchanges format with correct numbering."""
        from examples.barsoom import format_history_prefix

        history = [
            ("Question one?", "Answer one."),
            ("Question two?", "Answer two."),
            ("Question three?", "Answer three."),
        ]
        result = format_history_prefix(history)

        assert "Q1: Question one?" in result
        assert "A1: Answer one." in result
        assert "Q2: Question two?" in result
        assert "A2: Answer two." in result
        assert "Q3: Question three?" in result
        assert "A3: Answer three." in result
```

**Step 2: Run test to verify it passes**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryFormatting::test_format_history_prefix_multiple_exchanges -v`
Expected: PASS (implementation already handles this)

**Step 3: Commit**

```bash
git add tests/examples/test_barsoom.py
git commit -m "test(barsoom): add multiple exchanges test"
```

---

## Task 4: Add should_warn_history_size() Function

**Files:**
- Modify: `examples/barsoom.py`
- Test: `tests/examples/test_barsoom.py`

**Step 1: Add constants and write failing test for exchange limit**

Add constants to `examples/barsoom.py` after BOOKS dict (around line 24):

```python
HISTORY_WARN_CHARS = 50_000
HISTORY_WARN_EXCHANGES = 10
```

Add to `tests/examples/test_barsoom.py`:

```python
class TestHistoryWarning:
    """Test conversation history size warnings."""

    def test_should_warn_at_exchange_limit(self) -> None:
        """Warn when exchange count reaches threshold."""
        from examples.barsoom import HISTORY_WARN_EXCHANGES, should_warn_history_size

        # Just under limit - no warning
        history = [("q", "a") for _ in range(HISTORY_WARN_EXCHANGES - 1)]
        assert should_warn_history_size(history) is False

        # At limit - warn
        history.append(("q", "a"))
        assert should_warn_history_size(history) is True
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryWarning::test_should_warn_at_exchange_limit -v`
Expected: FAIL with "cannot import name 'should_warn_history_size'"

**Step 3: Write minimal implementation**

Add to `examples/barsoom.py` after `format_history_prefix()`:

```python
def should_warn_history_size(history: list[tuple[str, str]]) -> bool:
    """Check if history is large enough to warrant a warning."""
    if len(history) >= HISTORY_WARN_EXCHANGES:
        return True
    return False
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryWarning::test_should_warn_at_exchange_limit -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/barsoom.py tests/examples/test_barsoom.py
git commit -m "feat(barsoom): add should_warn_history_size with exchange limit"
```

---

## Task 5: Add Character Limit to Warning

**Files:**
- Modify: `examples/barsoom.py`
- Test: `tests/examples/test_barsoom.py`

**Step 1: Write failing test for character limit**

Add to `TestHistoryWarning` class:

```python
    def test_should_warn_at_char_limit(self) -> None:
        """Warn when character count reaches threshold."""
        from examples.barsoom import HISTORY_WARN_CHARS, should_warn_history_size

        # Create history with large content but few exchanges
        large_answer = "x" * (HISTORY_WARN_CHARS - 100)
        history = [("short question", large_answer)]
        assert should_warn_history_size(history) is False

        # Add more to exceed limit
        history.append(("another", "x" * 200))
        assert should_warn_history_size(history) is True

    def test_should_warn_empty_history(self) -> None:
        """Empty history should not warn."""
        from examples.barsoom import should_warn_history_size

        assert should_warn_history_size([]) is False
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryWarning::test_should_warn_at_char_limit -v`
Expected: FAIL with AssertionError (char limit not implemented)

**Step 3: Update implementation to include char limit**

Update function in `examples/barsoom.py`:

```python
def should_warn_history_size(history: list[tuple[str, str]]) -> bool:
    """Check if history is large enough to warrant a warning."""
    if len(history) >= HISTORY_WARN_EXCHANGES:
        return True
    total_chars = sum(len(q) + len(a) for q, a in history)
    return total_chars >= HISTORY_WARN_CHARS
```

**Step 4: Run all warning tests to verify they pass**

Run: `pytest tests/examples/test_barsoom.py::TestHistoryWarning -v`
Expected: PASS (all 3 tests)

**Step 5: Commit**

```bash
git add examples/barsoom.py tests/examples/test_barsoom.py
git commit -m "feat(barsoom): add character limit to history warning"
```

---

## Task 6: Update Import in Test File

**Files:**
- Modify: `tests/examples/test_barsoom.py`

**Step 1: Update the import statement**

Change the import at the top of `tests/examples/test_barsoom.py`:

```python
from examples.barsoom import (
    BOOKS,
    HISTORY_WARN_CHARS,
    HISTORY_WARN_EXCHANGES,
    ThinkingSpinner,
    format_history_prefix,
    format_progress,
    format_stats,
    is_exit_command,
    parse_args,
    should_warn_history_size,
)
```

**Step 2: Update tests to use top-level imports**

Update `TestHistoryFormatting` tests to remove local imports:

```python
class TestHistoryFormatting:
    """Test conversation history formatting."""

    def test_format_history_prefix_empty(self) -> None:
        """Empty history returns empty string."""
        result = format_history_prefix([])
        assert result == ""

    def test_format_history_prefix_single_exchange(self) -> None:
        """Single exchange formats correctly."""
        history = [("Who is Dejah Thoris?", "She is the Princess of Helium.")]
        result = format_history_prefix(history)

        assert "Previous conversation:" in result
        assert "Q1: Who is Dejah Thoris?" in result
        assert "A1: She is the Princess of Helium." in result
        assert "Current question:" in result

    def test_format_history_prefix_multiple_exchanges(self) -> None:
        """Multiple exchanges format with correct numbering."""
        history = [
            ("Question one?", "Answer one."),
            ("Question two?", "Answer two."),
            ("Question three?", "Answer three."),
        ]
        result = format_history_prefix(history)

        assert "Q1: Question one?" in result
        assert "A1: Answer one." in result
        assert "Q2: Question two?" in result
        assert "A2: Answer two." in result
        assert "Q3: Question three?" in result
        assert "A3: Answer three." in result
```

Update `TestHistoryWarning` tests similarly:

```python
class TestHistoryWarning:
    """Test conversation history size warnings."""

    def test_should_warn_at_exchange_limit(self) -> None:
        """Warn when exchange count reaches threshold."""
        # Just under limit - no warning
        history = [("q", "a") for _ in range(HISTORY_WARN_EXCHANGES - 1)]
        assert should_warn_history_size(history) is False

        # At limit - warn
        history.append(("q", "a"))
        assert should_warn_history_size(history) is True

    def test_should_warn_at_char_limit(self) -> None:
        """Warn when character count reaches threshold."""
        # Create history with large content but few exchanges
        large_answer = "x" * (HISTORY_WARN_CHARS - 100)
        history = [("short question", large_answer)]
        assert should_warn_history_size(history) is False

        # Add more to exceed limit
        history.append(("another", "x" * 200))
        assert should_warn_history_size(history) is True

    def test_should_warn_empty_history(self) -> None:
        """Empty history should not warn."""
        assert should_warn_history_size([]) is False
```

**Step 3: Run all tests to verify they pass**

Run: `pytest tests/examples/test_barsoom.py -v`
Expected: PASS (all tests)

**Step 4: Commit**

```bash
git add tests/examples/test_barsoom.py
git commit -m "refactor(test): use top-level imports for history functions"
```

---

## Task 7: Integrate History into Interactive Loop

**Files:**
- Modify: `examples/barsoom.py`

**Step 1: Add history initialization before interactive loop**

In `main()`, add after the print statements for "Ask questions..." (around line 228):

```python
    # Conversation history for follow-up questions
    history: list[tuple[str, str]] = []
```

**Step 2: Add warning check in the interactive loop**

In the interactive loop, after `if is_exit_command(user_input):` block, add:

```python
        # Check if history is getting large
        if should_warn_history_size(history):
            print(f"Warning: Conversation history is large ({len(history)} exchanges).")
            try:
                clear = input("Clear history? (y/n): ").strip().lower()
                if clear == "y":
                    history.clear()
                    print("History cleared.")
            except (EOFError, KeyboardInterrupt):
                pass  # User cancelled, continue with existing history
```

**Step 3: Prepend history to question**

In the try block where query is called, replace:

```python
            result = project.query(user_input, on_progress=on_progress)
```

with:

```python
            # Prepend conversation history for context
            prefix = format_history_prefix(history)
            full_question = f"{prefix}{user_input}" if prefix else user_input
            result = project.query(full_question, on_progress=on_progress)
```

**Step 4: Append successful Q&A to history**

After printing the result answer (after `print(result.answer)`), add:

```python
            # Store exchange in history
            history.append((user_input, result.answer))
```

**Step 5: Run all tests and type check**

Run: `pytest tests/examples/test_barsoom.py -v && mypy examples/barsoom.py`
Expected: All tests pass, no type errors

**Step 6: Commit**

```bash
git add examples/barsoom.py
git commit -m "feat(barsoom): integrate conversation history into interactive loop"
```

---

## Task 8: Final Verification

**Step 1: Run full test suite**

Run: `make all`
Expected: All checks pass (format, lint, typecheck, test)

**Step 2: Verify git log shows all commits**

Run: `git log --oneline -10`
Expected: 7 commits for this feature

**Step 3: Commit any final fixes if needed**

If any issues found, fix and commit.

---

## Summary

| Task | Description | Commits |
|------|-------------|---------|
| 1 | Add format_history_prefix stub | 1 |
| 2 | Implement format_history_prefix | 1 |
| 3 | Test multiple exchanges | 1 |
| 4 | Add should_warn_history_size | 1 |
| 5 | Add character limit | 1 |
| 6 | Refactor test imports | 1 |
| 7 | Integrate into main() | 1 |
| 8 | Final verification | 0-1 |

**Total:** 7-8 commits following TDD red-green-refactor cycle.
