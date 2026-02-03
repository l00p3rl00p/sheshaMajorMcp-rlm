# Git Repository Explorer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create an interactive git repository explorer script (`examples/repo.py`) that lets users explore arbitrary codebases using Shesha's RLM.

**Architecture:** Extract shared utilities from `barsoom.py` into `script_utils.py`, refactor `barsoom.py` to use the shared utilities, then create `repo.py` using those utilities plus new picker/update functionality.

**Tech Stack:** Python 3, argparse, Shesha API (create_project_from_repo, RepoProjectResult)

---

### Task 1: Create script_utils.py with ThinkingSpinner

**Files:**
- Create: `examples/script_utils.py`
- Test: `tests/unit/test_script_utils.py`

**Step 1: Write the failing test for ThinkingSpinner**

```python
# tests/unit/test_script_utils.py
"""Tests for script_utils shared utilities."""

import sys
import threading
import time
from io import StringIO
from unittest.mock import patch

import pytest


class TestThinkingSpinner:
    """Tests for ThinkingSpinner class."""

    def test_start_sets_running(self) -> None:
        """Start should set _running to True and create thread."""
        from examples.script_utils import ThinkingSpinner

        spinner = ThinkingSpinner()
        assert not spinner._running
        assert spinner._thread is None

        spinner.start()
        assert spinner._running
        assert spinner._thread is not None
        assert spinner._thread.is_alive()

        spinner.stop()

    def test_stop_clears_running(self) -> None:
        """Stop should set _running to False."""
        from examples.script_utils import ThinkingSpinner

        spinner = ThinkingSpinner()
        spinner.start()
        spinner.stop()

        assert not spinner._running
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_script_utils.py -v`
Expected: FAIL with "No module named 'examples.script_utils'"

**Step 3: Write minimal implementation**

```python
# examples/script_utils.py
#!/usr/bin/env python3
"""Shared utilities for Shesha example scripts."""

import sys
import threading
import time


class ThinkingSpinner:
    """Animated spinner that shows 'Thinking...' with animated dots."""

    def __init__(self) -> None:
        self._running = False
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        """Start the spinner animation."""
        self._running = True
        self._thread = threading.Thread(target=self._animate, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        """Stop the spinner and clear the line."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=0.5)
        # Clear the line
        print("\r" + " " * 20 + "\r", end="", flush=True)

    def _animate(self) -> None:
        """Animation loop running in background thread."""
        dots = 0
        while self._running:
            dots = (dots % 3) + 1
            print(f"\rThinking{'.' * dots}{' ' * (3 - dots)}", end="", flush=True)
            time.sleep(0.3)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_script_utils.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/script_utils.py tests/unit/test_script_utils.py
git commit -m "feat: add ThinkingSpinner to script_utils"
```

---

### Task 2: Add formatting functions to script_utils.py

**Files:**
- Modify: `examples/script_utils.py`
- Test: `tests/unit/test_script_utils.py`

**Step 1: Write failing tests for formatting functions**

Add to `tests/unit/test_script_utils.py`:

```python
from shesha.rlm.trace import StepType, TokenUsage, Trace


class TestFormatProgress:
    """Tests for format_progress function."""

    def test_format_with_elapsed(self) -> None:
        """Format progress with elapsed time."""
        from examples.script_utils import format_progress

        result = format_progress(StepType.CODE_GENERATED, 0, "code", elapsed_seconds=1.5)
        assert "[1.5s]" in result
        assert "[Iteration 1]" in result
        assert "Generating code" in result

    def test_format_without_elapsed(self) -> None:
        """Format progress without elapsed time."""
        from examples.script_utils import format_progress

        result = format_progress(StepType.FINAL_ANSWER, 2, "answer")
        assert "[Iteration 3]" in result
        assert "Final answer" in result


class TestFormatThoughtTime:
    """Tests for format_thought_time function."""

    def test_singular_second(self) -> None:
        """One second should use singular form."""
        from examples.script_utils import format_thought_time

        result = format_thought_time(1.2)
        assert result == "[Thought for 1 second]"

    def test_plural_seconds(self) -> None:
        """Multiple seconds should use plural form."""
        from examples.script_utils import format_thought_time

        result = format_thought_time(5.7)
        assert result == "[Thought for 6 seconds]"


class TestFormatStats:
    """Tests for format_stats function."""

    def test_format_stats_output(self) -> None:
        """Format stats should include all metrics."""
        from examples.script_utils import format_stats

        token_usage = TokenUsage(prompt_tokens=100, completion_tokens=50)
        trace = Trace(steps=[])

        result = format_stats(2.5, token_usage, trace)
        assert "Execution time: 2.50s" in result
        assert "Tokens: 150" in result
        assert "prompt: 100" in result
        assert "completion: 50" in result
        assert "Trace steps: 0" in result
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_script_utils.py::TestFormatProgress -v`
Expected: FAIL with "cannot import name 'format_progress'"

**Step 3: Add formatting functions to script_utils.py**

Add to `examples/script_utils.py`:

```python
from shesha.rlm.trace import StepType, TokenUsage, Trace


def format_progress(
    step_type: StepType, iteration: int, content: str, elapsed_seconds: float | None = None
) -> str:
    """Format a progress message for verbose output."""
    step_names = {
        StepType.CODE_GENERATED: "Generating code",
        StepType.CODE_OUTPUT: "Executing code",
        StepType.SUBCALL_REQUEST: "Sub-LLM query",
        StepType.SUBCALL_RESPONSE: "Sub-LLM response",
        StepType.FINAL_ANSWER: "Final answer",
        StepType.ERROR: "Error",
    }
    step_name = step_names.get(step_type, step_type.value)
    if elapsed_seconds is not None:
        return f"  [{elapsed_seconds:.1f}s] [Iteration {iteration + 1}] {step_name}"
    return f"  [Iteration {iteration + 1}] {step_name}"


def format_thought_time(elapsed_seconds: float) -> str:
    """Format elapsed time as '[Thought for N seconds]'."""
    seconds = round(elapsed_seconds)
    unit = "second" if seconds == 1 else "seconds"
    return f"[Thought for {seconds} {unit}]"


def format_stats(execution_time: float, token_usage: TokenUsage, trace: Trace) -> str:
    """Format verbose stats for display after an answer."""
    prompt = token_usage.prompt_tokens
    completion = token_usage.completion_tokens
    total = token_usage.total_tokens
    lines = [
        "---",
        f"Execution time: {execution_time:.2f}s",
        f"Tokens: {total} (prompt: {prompt}, completion: {completion})",
        f"Trace steps: {len(trace.steps)}",
    ]
    return "\n".join(lines)
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_script_utils.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/script_utils.py tests/unit/test_script_utils.py
git commit -m "feat: add formatting functions to script_utils"
```

---

### Task 3: Add history helper functions to script_utils.py

**Files:**
- Modify: `examples/script_utils.py`
- Test: `tests/unit/test_script_utils.py`

**Step 1: Write failing tests for history helpers**

Add to `tests/unit/test_script_utils.py`:

```python
class TestFormatHistoryPrefix:
    """Tests for format_history_prefix function."""

    def test_empty_history(self) -> None:
        """Empty history returns empty string."""
        from examples.script_utils import format_history_prefix

        assert format_history_prefix([]) == ""

    def test_single_exchange(self) -> None:
        """Single exchange formats correctly."""
        from examples.script_utils import format_history_prefix

        history = [("What is X?", "X is Y.")]
        result = format_history_prefix(history)
        assert "Previous conversation:" in result
        assert "Q1: What is X?" in result
        assert "A1: X is Y." in result
        assert "Current question:" in result


class TestIsExitCommand:
    """Tests for is_exit_command function."""

    def test_quit_is_exit(self) -> None:
        """'quit' should be recognized as exit."""
        from examples.script_utils import is_exit_command

        assert is_exit_command("quit")
        assert is_exit_command("QUIT")
        assert is_exit_command("Quit")

    def test_exit_is_exit(self) -> None:
        """'exit' should be recognized as exit."""
        from examples.script_utils import is_exit_command

        assert is_exit_command("exit")
        assert is_exit_command("EXIT")

    def test_other_not_exit(self) -> None:
        """Other inputs should not be exit commands."""
        from examples.script_utils import is_exit_command

        assert not is_exit_command("hello")
        assert not is_exit_command("question")


class TestShouldWarnHistorySize:
    """Tests for should_warn_history_size function."""

    def test_small_history_no_warning(self) -> None:
        """Small history should not trigger warning."""
        from examples.script_utils import should_warn_history_size

        history = [("q", "a") for _ in range(5)]
        assert not should_warn_history_size(history)

    def test_many_exchanges_warns(self) -> None:
        """10+ exchanges should trigger warning."""
        from examples.script_utils import should_warn_history_size

        history = [("q", "a") for _ in range(10)]
        assert should_warn_history_size(history)

    def test_large_chars_warns(self) -> None:
        """50k+ chars should trigger warning."""
        from examples.script_utils import should_warn_history_size

        # Create history with large content
        large_text = "x" * 30000
        history = [("q", large_text)]
        assert should_warn_history_size(history)
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_script_utils.py::TestFormatHistoryPrefix -v`
Expected: FAIL with "cannot import name 'format_history_prefix'"

**Step 3: Add history helpers to script_utils.py**

Add to `examples/script_utils.py`:

```python
# Constants
HISTORY_WARN_CHARS = 50_000
HISTORY_WARN_EXCHANGES = 10


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


def is_exit_command(user_input: str) -> bool:
    """Check if user input is an exit command."""
    return user_input.lower() in ("quit", "exit")


def should_warn_history_size(history: list[tuple[str, str]]) -> bool:
    """Check if history is large enough to warrant a warning."""
    if len(history) >= HISTORY_WARN_EXCHANGES:
        return True
    total_chars = sum(len(q) + len(a) for q, a in history)
    return total_chars >= HISTORY_WARN_CHARS
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_script_utils.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/script_utils.py tests/unit/test_script_utils.py
git commit -m "feat: add history helpers to script_utils"
```

---

### Task 4: Add urllib3 cleanup hook to script_utils.py

**Files:**
- Modify: `examples/script_utils.py`
- Test: `tests/unit/test_script_utils.py`

**Step 1: Write failing test for urllib3 hook**

Add to `tests/unit/test_script_utils.py`:

```python
class TestInstallUrllib3CleanupHook:
    """Tests for install_urllib3_cleanup_hook function."""

    def test_hook_installed(self) -> None:
        """Hook should be installed on sys.unraisablehook."""
        from examples.script_utils import install_urllib3_cleanup_hook

        original = sys.unraisablehook
        install_urllib3_cleanup_hook()

        # Hook should be changed
        assert sys.unraisablehook != original

        # Restore original
        sys.unraisablehook = original
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_script_utils.py::TestInstallUrllib3CleanupHook -v`
Expected: FAIL with "cannot import name 'install_urllib3_cleanup_hook'"

**Step 3: Add urllib3 hook to script_utils.py**

Add to `examples/script_utils.py`:

```python
def install_urllib3_cleanup_hook() -> None:
    """Install hook to suppress harmless urllib3 cleanup errors during shutdown.

    When Python exits, objects are garbage collected in arbitrary order. If the
    underlying file handle gets closed before urllib3's HTTPResponse finalizer
    runs, it raises "ValueError: I/O operation on closed file". This is harmless
    (the connection is being closed anyway) but produces ugly output. We suppress
    only this specific error while letting other unraisable exceptions through.
    """
    original_hook = sys.unraisablehook

    def suppress_urllib3_error(unraisable: sys.UnraisableHookArgs) -> None:
        if unraisable.exc_type is ValueError and "I/O operation on closed file" in str(
            unraisable.exc_value
        ):
            return
        original_hook(unraisable)

    sys.unraisablehook = suppress_urllib3_error
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_script_utils.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/script_utils.py tests/unit/test_script_utils.py
git commit -m "feat: add urllib3 cleanup hook to script_utils"
```

---

### Task 5: Refactor barsoom.py to use script_utils

**Files:**
- Modify: `examples/barsoom.py`

**Step 1: Verify barsoom.py works before refactoring**

Run: `python examples/barsoom.py --help`
Expected: Shows help with --setup, --verbose, --prompt options

**Step 2: Refactor barsoom.py to import from script_utils**

Replace the duplicated code in `examples/barsoom.py`:

Remove these sections (lines 25-123 approximately):
- `HISTORY_WARN_CHARS` and `HISTORY_WARN_EXCHANGES` constants
- `ThinkingSpinner` class
- `format_progress` function
- `is_exit_command` function
- `format_thought_time` function
- `format_stats` function
- `format_history_prefix` function
- `should_warn_history_size` function
- `_install_urllib3_cleanup_hook` function

Replace with import at top of file:

```python
from script_utils import (
    HISTORY_WARN_CHARS,
    HISTORY_WARN_EXCHANGES,
    ThinkingSpinner,
    format_history_prefix,
    format_progress,
    format_stats,
    format_thought_time,
    install_urllib3_cleanup_hook,
    is_exit_command,
    should_warn_history_size,
)
```

Update the call in `main()` from `_install_urllib3_cleanup_hook()` to `install_urllib3_cleanup_hook()`.

**Step 3: Run tests to verify nothing broke**

Run: `pytest tests/ -v -k "not integration"`
Expected: All tests pass

**Step 4: Verify barsoom.py still works**

Run: `python examples/barsoom.py --help`
Expected: Same help output as before

**Step 5: Commit**

```bash
git add examples/barsoom.py
git commit -m "refactor: use script_utils in barsoom.py"
```

---

### Task 6: Create repo.py with argument parsing

**Files:**
- Create: `examples/repo.py`
- Test: `tests/unit/test_repo_script.py`

**Step 1: Write failing test for parse_args**

```python
# tests/unit/test_repo_script.py
"""Tests for repo.py script."""

import pytest


class TestParseArgs:
    """Tests for parse_args function."""

    def test_no_args(self) -> None:
        """No args should work (for picker mode)."""
        from examples.repo import parse_args

        args = parse_args([])
        assert args.repo is None
        assert not args.update
        assert not args.verbose

    def test_repo_positional(self) -> None:
        """Repo URL should be captured as positional arg."""
        from examples.repo import parse_args

        args = parse_args(["https://github.com/user/repo"])
        assert args.repo == "https://github.com/user/repo"

    def test_local_path(self) -> None:
        """Local path should be captured."""
        from examples.repo import parse_args

        args = parse_args(["/path/to/repo"])
        assert args.repo == "/path/to/repo"

    def test_update_flag(self) -> None:
        """--update flag should be captured."""
        from examples.repo import parse_args

        args = parse_args(["https://github.com/user/repo", "--update"])
        assert args.update

    def test_verbose_flag(self) -> None:
        """--verbose flag should be captured."""
        from examples.repo import parse_args

        args = parse_args(["https://github.com/user/repo", "--verbose"])
        assert args.verbose
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_repo_script.py -v`
Expected: FAIL with "No module named 'examples.repo'"

**Step 3: Create repo.py with parse_args**

```python
# examples/repo.py
#!/usr/bin/env python3
"""Interactive git repository explorer using Shesha."""

import argparse
import os
import sys
import time

from script_utils import (
    ThinkingSpinner,
    format_history_prefix,
    format_progress,
    format_stats,
    format_thought_time,
    install_urllib3_cleanup_hook,
    is_exit_command,
    should_warn_history_size,
)

from shesha import Shesha
from shesha.config import SheshaConfig
from shesha.models import RepoProjectResult
from shesha.rlm.trace import StepType

STORAGE_PATH = "./repo_data"


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Explore git repositories using Shesha RLM"
    )
    parser.add_argument(
        "repo",
        nargs="?",
        help="Git repository URL or local path (shows picker if omitted)",
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Auto-apply updates without prompting",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show execution stats after each answer",
    )
    return parser.parse_args(argv)


if __name__ == "__main__":
    pass
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_repo_script.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/repo.py tests/unit/test_repo_script.py
git commit -m "feat: add repo.py with argument parsing"
```

---

### Task 7: Add picker functions to repo.py

**Files:**
- Modify: `examples/repo.py`
- Test: `tests/unit/test_repo_script.py`

**Step 1: Write failing tests for picker functions**

Add to `tests/unit/test_repo_script.py`:

```python
from unittest.mock import MagicMock, patch


class TestShowPicker:
    """Tests for show_picker function."""

    def test_no_projects_returns_none(self) -> None:
        """No projects should prompt for URL, not show picker."""
        from examples.repo import show_picker

        mock_shesha = MagicMock()
        mock_shesha.list_projects.return_value = []

        # Should return None when no projects (prompt_for_repo handles that case)
        result = show_picker(mock_shesha)
        assert result is None

    def test_with_projects_shows_list(self, capsys: pytest.CaptureFixture[str]) -> None:
        """Projects should be listed with numbers."""
        from examples.repo import show_picker

        mock_shesha = MagicMock()
        mock_shesha.list_projects.return_value = ["project-a", "project-b"]

        with patch("builtins.input", return_value="1"):
            result = show_picker(mock_shesha)

        captured = capsys.readouterr()
        assert "1. project-a" in captured.out
        assert "2. project-b" in captured.out
        assert result == "project-a"

    def test_select_by_number(self) -> None:
        """Selecting a number returns corresponding project name."""
        from examples.repo import show_picker

        mock_shesha = MagicMock()
        mock_shesha.list_projects.return_value = ["project-a", "project-b"]

        with patch("builtins.input", return_value="2"):
            result = show_picker(mock_shesha)

        assert result == "project-b"

    def test_enter_new_url(self) -> None:
        """Entering a URL should return it."""
        from examples.repo import show_picker

        mock_shesha = MagicMock()
        mock_shesha.list_projects.return_value = ["project-a"]

        with patch("builtins.input", return_value="https://github.com/new/repo"):
            result = show_picker(mock_shesha)

        assert result == "https://github.com/new/repo"


class TestPromptForRepo:
    """Tests for prompt_for_repo function."""

    def test_returns_input(self) -> None:
        """Should return user input."""
        from examples.repo import prompt_for_repo

        with patch("builtins.input", return_value="https://github.com/user/repo"):
            result = prompt_for_repo()

        assert result == "https://github.com/user/repo"

    def test_strips_whitespace(self) -> None:
        """Should strip whitespace from input."""
        from examples.repo import prompt_for_repo

        with patch("builtins.input", return_value="  /path/to/repo  "):
            result = prompt_for_repo()

        assert result == "/path/to/repo"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_repo_script.py::TestShowPicker -v`
Expected: FAIL with "cannot import name 'show_picker'"

**Step 3: Add picker functions to repo.py**

Add to `examples/repo.py`:

```python
def show_picker(shesha: Shesha) -> str | None:
    """Show interactive repo picker. Returns project name, URL, or None if no projects."""
    projects = shesha.list_projects()
    if not projects:
        return None

    print("Available repositories:")
    for i, name in enumerate(projects, 1):
        print(f"  {i}. {name}")
    print()

    user_input = input("Enter number or new repo URL: ").strip()

    # Check if it's a number
    try:
        num = int(user_input)
        if 1 <= num <= len(projects):
            return projects[num - 1]
    except ValueError:
        pass

    # Otherwise treat as URL/path
    return user_input


def prompt_for_repo() -> str:
    """Prompt user to enter a repo URL or path."""
    print("No repositories loaded yet.")
    return input("Enter repo URL or local path: ").strip()
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_repo_script.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/repo.py tests/unit/test_repo_script.py
git commit -m "feat: add picker functions to repo.py"
```

---

### Task 8: Add update handling to repo.py

**Files:**
- Modify: `examples/repo.py`
- Test: `tests/unit/test_repo_script.py`

**Step 1: Write failing tests for handle_updates**

Add to `tests/unit/test_repo_script.py`:

```python
class TestHandleUpdates:
    """Tests for handle_updates function."""

    def test_created_status_returns_same(self) -> None:
        """Status 'created' should return the same result."""
        from examples.repo import handle_updates

        mock_result = MagicMock()
        mock_result.status = "created"
        mock_result.files_ingested = 42

        result = handle_updates(mock_result, auto_update=False)
        assert result is mock_result

    def test_unchanged_status_returns_same(self) -> None:
        """Status 'unchanged' should return the same result."""
        from examples.repo import handle_updates

        mock_result = MagicMock()
        mock_result.status = "unchanged"

        result = handle_updates(mock_result, auto_update=False)
        assert result is mock_result

    def test_updates_available_auto_applies(self) -> None:
        """With --update flag, should auto-apply updates."""
        from examples.repo import handle_updates

        updated_result = MagicMock()
        mock_result = MagicMock()
        mock_result.status = "updates_available"
        mock_result.apply_updates.return_value = updated_result

        result = handle_updates(mock_result, auto_update=True)
        mock_result.apply_updates.assert_called_once()
        assert result is updated_result

    def test_updates_available_prompts_user_yes(self) -> None:
        """Without --update, should prompt and apply if 'y'."""
        from examples.repo import handle_updates

        updated_result = MagicMock()
        mock_result = MagicMock()
        mock_result.status = "updates_available"
        mock_result.project.name = "test-repo"
        mock_result.apply_updates.return_value = updated_result

        with patch("builtins.input", return_value="y"):
            result = handle_updates(mock_result, auto_update=False)

        mock_result.apply_updates.assert_called_once()
        assert result is updated_result

    def test_updates_available_prompts_user_no(self) -> None:
        """Without --update, should prompt and skip if 'n'."""
        from examples.repo import handle_updates

        mock_result = MagicMock()
        mock_result.status = "updates_available"
        mock_result.project.name = "test-repo"

        with patch("builtins.input", return_value="n"):
            result = handle_updates(mock_result, auto_update=False)

        mock_result.apply_updates.assert_not_called()
        assert result is mock_result
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_repo_script.py::TestHandleUpdates -v`
Expected: FAIL with "cannot import name 'handle_updates'"

**Step 3: Add handle_updates to repo.py**

Add to `examples/repo.py`:

```python
def handle_updates(result: RepoProjectResult, auto_update: bool) -> RepoProjectResult:
    """Handle update prompting. Returns updated result if applied."""
    if result.status != "updates_available":
        return result

    if auto_update:
        print("Applying updates...")
        return result.apply_updates()

    print(f"Updates available for {result.project.name}.")
    response = input("Apply updates? (y/n): ").strip().lower()

    if response == "y":
        print("Applying updates...")
        return result.apply_updates()

    return result
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_repo_script.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/repo.py tests/unit/test_repo_script.py
git commit -m "feat: add update handling to repo.py"
```

---

### Task 9: Add interactive REPL loop to repo.py

**Files:**
- Modify: `examples/repo.py`
- Test: `tests/unit/test_repo_script.py`

**Step 1: Write failing test for run_interactive_loop**

Add to `tests/unit/test_repo_script.py`:

```python
class TestRunInteractiveLoop:
    """Tests for run_interactive_loop function."""

    def test_quit_exits_loop(self, capsys: pytest.CaptureFixture[str]) -> None:
        """Typing 'quit' should exit the loop."""
        from examples.repo import run_interactive_loop

        mock_project = MagicMock()

        with patch("builtins.input", return_value="quit"):
            run_interactive_loop(mock_project, verbose=False)

        captured = capsys.readouterr()
        assert "Goodbye!" in captured.out
        mock_project.query.assert_not_called()

    def test_exit_exits_loop(self, capsys: pytest.CaptureFixture[str]) -> None:
        """Typing 'exit' should exit the loop."""
        from examples.repo import run_interactive_loop

        mock_project = MagicMock()

        with patch("builtins.input", return_value="exit"):
            run_interactive_loop(mock_project, verbose=False)

        captured = capsys.readouterr()
        assert "Goodbye!" in captured.out

    def test_empty_input_continues(self) -> None:
        """Empty input should continue loop without query."""
        from examples.repo import run_interactive_loop

        mock_project = MagicMock()

        # First empty, then quit
        with patch("builtins.input", side_effect=["", "quit"]):
            run_interactive_loop(mock_project, verbose=False)

        mock_project.query.assert_not_called()

    def test_query_is_made(self) -> None:
        """Questions should trigger project.query."""
        from examples.repo import run_interactive_loop

        mock_result = MagicMock()
        mock_result.answer = "The answer is 42"
        mock_result.execution_time = 1.5
        mock_result.token_usage = MagicMock(prompt_tokens=10, completion_tokens=5, total_tokens=15)
        mock_result.trace = MagicMock(steps=[])

        mock_project = MagicMock()
        mock_project.query.return_value = mock_result

        with patch("builtins.input", side_effect=["What is X?", "quit"]):
            run_interactive_loop(mock_project, verbose=False)

        mock_project.query.assert_called_once()
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_repo_script.py::TestRunInteractiveLoop -v`
Expected: FAIL with "cannot import name 'run_interactive_loop'"

**Step 3: Add run_interactive_loop to repo.py**

Add to `examples/repo.py`:

```python
def run_interactive_loop(project: "Project", verbose: bool) -> None:
    """Run the interactive question-answer loop."""
    from shesha.storage.base import Project

    print()
    print(f'Ask questions about the codebase. Type "quit" or "exit" to leave.')
    print()

    history: list[tuple[str, str]] = []

    while True:
        try:
            user_input = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        if is_exit_command(user_input):
            print("Goodbye!")
            break

        if should_warn_history_size(history):
            print(f"Warning: Conversation history is large ({len(history)} exchanges).")
            try:
                clear = input("Clear history? (y/n): ").strip().lower()
                if clear == "y":
                    history.clear()
                    print("History cleared.")
            except (EOFError, KeyboardInterrupt):
                pass

        try:
            spinner = ThinkingSpinner()
            spinner.start()
            query_start_time = time.time()

            def on_progress(step_type: StepType, iteration: int, content: str) -> None:
                if verbose:
                    spinner.stop()
                    elapsed = time.time() - query_start_time
                    print(format_progress(step_type, iteration, content, elapsed_seconds=elapsed))
                    spinner.start()

            prefix = format_history_prefix(history)
            full_question = f"{prefix}{user_input}" if prefix else user_input
            result = project.query(full_question, on_progress=on_progress)
            spinner.stop()

            elapsed = time.time() - query_start_time
            print(format_thought_time(elapsed))
            print(result.answer)
            print()

            history.append((user_input, result.answer))

            if verbose:
                print(format_stats(result.execution_time, result.token_usage, result.trace))
                print()

        except Exception as e:
            spinner.stop()
            print(f"Error: {e}")
            print('Try again or type "quit" to exit.')
            print()
```

Also add the import for Project at top:

```python
from shesha.storage.base import Project
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_repo_script.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/repo.py tests/unit/test_repo_script.py
git commit -m "feat: add interactive REPL loop to repo.py"
```

---

### Task 10: Add main() function to repo.py

**Files:**
- Modify: `examples/repo.py`
- Test: `tests/unit/test_repo_script.py`

**Step 1: Write failing test for main (mocked)**

Add to `tests/unit/test_repo_script.py`:

```python
class TestMain:
    """Tests for main function."""

    def test_no_api_key_exits(self, capsys: pytest.CaptureFixture[str]) -> None:
        """Missing API key should print error and exit."""
        from examples.repo import main

        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(SystemExit) as exc_info:
                main()

        assert exc_info.value.code == 1
        captured = capsys.readouterr()
        assert "SHESHA_API_KEY" in captured.out
```

Add `import os` to the test file imports.

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_repo_script.py::TestMain -v`
Expected: FAIL with "cannot import name 'main'"

**Step 3: Add main() to repo.py**

Add to `examples/repo.py`:

```python
def main() -> None:
    """Main entry point."""
    install_urllib3_cleanup_hook()
    args = parse_args()

    if not os.environ.get("SHESHA_API_KEY"):
        print("Error: SHESHA_API_KEY environment variable not set.")
        print()
        print("Environment variables:")
        print("  SHESHA_API_KEY   (required) API key for your LLM provider")
        print("  SHESHA_MODEL     (optional) Model name, e.g.:")
        print("                   - claude-sonnet-4-20250514 (default, Anthropic)")
        print("                   - gpt-4o (OpenAI)")
        print("                   - gemini/gemini-1.5-pro (Google)")
        print()
        print("The provider is auto-detected from the model name via LiteLLM.")
        sys.exit(1)

    config = SheshaConfig.load(storage_path=STORAGE_PATH)
    shesha = Shesha(config=config)

    # Determine which repo to use
    if args.repo:
        repo_url = args.repo
    else:
        # Interactive picker mode
        repo_url = show_picker(shesha)
        if repo_url is None:
            repo_url = prompt_for_repo()
        if not repo_url:
            print("No repository specified. Exiting.")
            sys.exit(0)

    # Load or create project
    print(f"Loading repository: {repo_url}")
    result = shesha.create_project_from_repo(repo_url)

    # Handle status
    if result.status == "created":
        print(f"Loaded {result.files_ingested} files.")
    elif result.status == "unchanged":
        print(f"Using cached repository ({result.files_ingested} files).")

    result = handle_updates(result, args.update)

    if result.status == "created":
        print(f"Updated: {result.files_ingested} files.")

    # Enter interactive loop
    run_interactive_loop(result.project, args.verbose)


if __name__ == "__main__":
    main()
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_repo_script.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add examples/repo.py tests/unit/test_repo_script.py
git commit -m "feat: add main() to repo.py"
```

---

### Task 11: Make repo.py executable and test end-to-end

**Files:**
- Modify: `examples/repo.py`

**Step 1: Make repo.py executable**

Run: `chmod +x examples/repo.py`

**Step 2: Verify help output**

Run: `python examples/repo.py --help`
Expected output:
```
usage: repo.py [-h] [--update] [--verbose] [repo]

Explore git repositories using Shesha RLM

positional arguments:
  repo        Git repository URL or local path (shows picker if omitted)

options:
  -h, --help  show this help message and exit
  --update    Auto-apply updates without prompting
  --verbose   Show execution stats after each answer
```

**Step 3: Run full test suite**

Run: `pytest tests/ -v -k "not integration"`
Expected: All tests pass

**Step 4: Run linting and type checking**

Run: `make all`
Expected: All checks pass

**Step 5: Commit**

```bash
git add examples/repo.py
git commit -m "feat: make repo.py executable"
```

---

### Task 12: Final verification and cleanup

**Files:**
- All created files

**Step 1: Run full test suite including integration**

Run: `pytest tests/ -v`
Expected: All tests pass

**Step 2: Verify both scripts work**

Run: `python examples/barsoom.py --help`
Expected: Help output for barsoom

Run: `python examples/repo.py --help`
Expected: Help output for repo

**Step 3: Run make all**

Run: `make all`
Expected: Format, lint, typecheck, and tests all pass

**Step 4: Review git log for clean history**

Run: `git log --oneline -15`
Expected: Clean commit history with meaningful messages

**Step 5: No commit needed - verification only**
