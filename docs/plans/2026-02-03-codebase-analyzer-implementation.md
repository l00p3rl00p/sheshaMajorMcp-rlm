# Codebase Analyzer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `shesha.create_project_from_repo()` to ingest git repositories with line-numbered content for accurate file:line citations.

**Architecture:** New `RepoIngester` class handles git operations (clone/fetch/SHA tracking). Modified `CodeParser` formats content with file headers and line numbers. New `RepoProjectResult` return type provides status and `apply_updates()` method.

**Tech Stack:** Python 3.13, git CLI (subprocess), chardet for encoding detection

**Design Doc:** `docs/plans/2026-02-03-codebase-analyzer-design.md`

---

## Task 1: Add RepoProjectResult Dataclass

**Files:**
- Modify: `src/shesha/models.py`
- Test: `tests/unit/test_models.py` (new file)

**Step 1: Write failing test for RepoProjectResult**

Create `tests/unit/test_models.py`:

```python
"""Tests for data models."""

from unittest.mock import MagicMock

import pytest

from shesha.models import RepoProjectResult


class TestRepoProjectResult:
    """Tests for RepoProjectResult dataclass."""

    def test_created_status(self):
        """RepoProjectResult can be created with 'created' status."""
        mock_project = MagicMock()
        result = RepoProjectResult(
            project=mock_project,
            status="created",
            files_ingested=10,
            files_skipped=2,
            warnings=["some warning"],
        )

        assert result.project is mock_project
        assert result.status == "created"
        assert result.files_ingested == 10
        assert result.files_skipped == 2
        assert result.warnings == ["some warning"]
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_models.py::TestRepoProjectResult::test_created_status -v`
Expected: FAIL with ImportError (RepoProjectResult not defined)

**Step 3: Write minimal implementation**

Add to `src/shesha/models.py`:

```python
from typing import TYPE_CHECKING, Literal

if TYPE_CHECKING:
    from shesha.project import Project


@dataclass
class RepoProjectResult:
    """Result from create_project_from_repo()."""

    project: "Project"
    status: Literal["created", "unchanged", "updates_available"]
    files_ingested: int
    files_skipped: int = 0
    warnings: list[str] = field(default_factory=list)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_models.py::TestRepoProjectResult::test_created_status -v`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/test_models.py src/shesha/models.py
git commit -m "feat(models): add RepoProjectResult dataclass"
```

---

## Task 2: Add apply_updates Method to RepoProjectResult

**Files:**
- Modify: `src/shesha/models.py`
- Modify: `tests/unit/test_models.py`

**Step 1: Write failing test for apply_updates**

Add to `tests/unit/test_models.py`:

```python
    def test_apply_updates_stores_callback(self):
        """RepoProjectResult stores apply_updates callback."""
        mock_project = MagicMock()
        callback_called = []

        def mock_callback():
            callback_called.append(True)
            return RepoProjectResult(
                project=mock_project,
                status="created",
                files_ingested=15,
            )

        result = RepoProjectResult(
            project=mock_project,
            status="updates_available",
            files_ingested=10,
            _apply_updates_fn=mock_callback,
        )

        updated = result.apply_updates()
        assert callback_called == [True]
        assert updated.files_ingested == 15

    def test_apply_updates_raises_when_unchanged(self):
        """apply_updates raises ValueError when status is not 'updates_available'."""
        mock_project = MagicMock()
        result = RepoProjectResult(
            project=mock_project,
            status="unchanged",
            files_ingested=10,
        )

        with pytest.raises(ValueError, match="only valid when status is 'updates_available'"):
            result.apply_updates()
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_models.py::TestRepoProjectResult::test_apply_updates_stores_callback -v`
Expected: FAIL (no _apply_updates_fn field)

**Step 3: Write minimal implementation**

Update `RepoProjectResult` in `src/shesha/models.py`:

```python
from typing import Callable, TYPE_CHECKING, Literal

if TYPE_CHECKING:
    from shesha.project import Project


@dataclass
class RepoProjectResult:
    """Result from create_project_from_repo()."""

    project: "Project"
    status: Literal["created", "unchanged", "updates_available"]
    files_ingested: int
    files_skipped: int = 0
    warnings: list[str] = field(default_factory=list)
    _apply_updates_fn: Callable[[], "RepoProjectResult"] | None = field(
        default=None, repr=False
    )

    def apply_updates(self) -> "RepoProjectResult":
        """Pull changes and re-ingest. Only valid when status is 'updates_available'."""
        if self.status != "updates_available":
            raise ValueError("apply_updates() is only valid when status is 'updates_available'")
        if self._apply_updates_fn is None:
            raise ValueError("No apply_updates function provided")
        return self._apply_updates_fn()
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_models.py::TestRepoProjectResult -v`
Expected: PASS (all 3 tests)

**Step 5: Commit**

```bash
git add src/shesha/models.py tests/unit/test_models.py
git commit -m "feat(models): add apply_updates() to RepoProjectResult"
```

---

## Task 3: Add Repository Error Classes

**Files:**
- Modify: `src/shesha/exceptions.py`
- Test: `tests/unit/test_exceptions.py` (new file)

**Step 1: Write failing tests for new exceptions**

Create `tests/unit/test_exceptions.py`:

```python
"""Tests for exception classes."""

from shesha.exceptions import AuthenticationError, RepoIngestError


class TestRepoExceptions:
    """Tests for repository-related exceptions."""

    def test_authentication_error_message(self):
        """AuthenticationError formats message with URL."""
        err = AuthenticationError("https://github.com/org/private-repo")
        assert "private-repo" in str(err)
        assert "token" in str(err).lower()

    def test_repo_ingest_error_preserves_cause(self):
        """RepoIngestError preserves the original cause."""
        cause = RuntimeError("git clone failed")
        err = RepoIngestError("https://github.com/org/repo", cause)
        assert err.__cause__ is cause
        assert "https://github.com/org/repo" in str(err)
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_exceptions.py -v`
Expected: FAIL (ImportError - exceptions not defined)

**Step 3: Write minimal implementation**

Add to `src/shesha/exceptions.py`:

```python
class RepoError(SheshaError):
    """Base exception for repository-related errors."""


class AuthenticationError(RepoError):
    """Raised when repository authentication fails."""

    def __init__(self, url: str) -> None:
        self.url = url
        super().__init__(
            f"Authentication failed for '{url}'. "
            "Pass `token=` parameter or set GITHUB_TOKEN/GITLAB_TOKEN/BITBUCKET_TOKEN environment variable."
        )


class RepoIngestError(RepoError):
    """Raised when repository ingestion fails."""

    def __init__(self, url: str, cause: Exception | None = None) -> None:
        self.url = url
        msg = f"Failed to ingest repository '{url}'"
        if cause:
            msg += f": {cause}"
        super().__init__(msg)
        if cause:
            self.__cause__ = cause
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_exceptions.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/exceptions.py tests/unit/test_exceptions.py
git commit -m "feat(exceptions): add AuthenticationError and RepoIngestError"
```

---

## Task 4: Export New Types in Package Init

**Files:**
- Modify: `src/shesha/__init__.py`
- Test: Manual verification via import

**Step 1: Verify current exports don't include new types**

Run: `python -c "from shesha import RepoProjectResult" 2>&1 || echo "Not exported yet"`
Expected: ImportError

**Step 2: Add exports**

Update `src/shesha/__init__.py` imports:

```python
from shesha.models import ParsedDocument, RepoProjectResult
from shesha.exceptions import (
    AuthenticationError,
    DocumentError,
    DocumentNotFoundError,
    NoParserError,
    ParseError,
    ProjectError,
    ProjectExistsError,
    ProjectNotFoundError,
    RepoError,
    RepoIngestError,
    SheshaError,
)
```

Update `__all__`:

```python
__all__ = [
    "__version__",
    # Main API
    "Shesha",
    "Project",
    "SheshaConfig",
    # Query results
    "ProgressCallback",
    "QueryResult",
    "RepoProjectResult",  # NEW
    "Trace",
    "TraceStep",
    "StepType",
    "TokenUsage",
    # Storage
    "FilesystemStorage",
    "ParsedDocument",
    # Exceptions
    "SheshaError",
    "ProjectError",
    "ProjectNotFoundError",
    "ProjectExistsError",
    "DocumentError",
    "DocumentNotFoundError",
    "ParseError",
    "NoParserError",
    "RepoError",  # NEW
    "AuthenticationError",  # NEW
    "RepoIngestError",  # NEW
]
```

**Step 3: Verify exports work**

Run: `python -c "from shesha import RepoProjectResult, AuthenticationError, RepoIngestError; print('OK')"`
Expected: OK

**Step 4: Run full test suite**

Run: `pytest tests/unit/ -v`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/shesha/__init__.py
git commit -m "feat: export RepoProjectResult and repo exceptions"
```

---

## Task 5: Add Line Number Formatting to CodeParser

**Files:**
- Modify: `src/shesha/parser/code.py`
- Modify: `tests/unit/parser/test_code.py`

**Step 1: Write failing test for line number formatting**

Add to `tests/unit/parser/test_code.py`:

```python
    def test_parse_with_line_numbers(self, parser: CodeParser, fixtures_dir: Path):
        """CodeParser formats with line numbers when enabled."""
        doc = parser.parse(
            fixtures_dir / "sample.py",
            include_line_numbers=True,
            file_path="src/sample.py",
        )

        # Should have file header
        assert "=== FILE: src/sample.py ===" in doc.content

        # Should have line numbers
        lines = doc.content.split("\n")
        # First line is header, second is content
        assert lines[1].strip().startswith("1|")

    def test_line_number_padding_adjusts(self, parser: CodeParser, tmp_path: Path):
        """Line number padding adjusts to file length."""
        # Create a file with 100+ lines
        content = "\n".join([f"line {i}" for i in range(150)])
        test_file = tmp_path / "many_lines.py"
        test_file.write_text(content)

        doc = parser.parse(test_file, include_line_numbers=True, file_path="many_lines.py")
        lines = doc.content.split("\n")

        # Line 1 should be padded to 3 digits (for 150 lines)
        assert "  1|" in lines[1]
        # Line 100 should be padded to 3 digits
        assert "100|" in lines[100]
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/parser/test_code.py::TestCodeParser::test_parse_with_line_numbers -v`
Expected: FAIL (unexpected keyword argument)

**Step 3: Write minimal implementation**

Update `parse` method in `src/shesha/parser/code.py`:

```python
def parse(
    self,
    path: Path,
    include_line_numbers: bool = False,
    file_path: str | None = None,
) -> ParsedDocument:
    """Parse a code file and return a ParsedDocument.

    Args:
        path: Path to the file to parse.
        include_line_numbers: If True, format with line numbers and file header.
        file_path: Path to show in the file header (defaults to path.name).
    """
    content = path.read_text(encoding="utf-8")
    ext = path.suffix.lower()
    language = EXTENSION_TO_LANGUAGE.get(ext, "unknown")

    if include_line_numbers:
        display_path = file_path or path.name
        content = self._format_with_line_numbers(content, display_path)

    return ParsedDocument(
        name=path.name,
        content=content,
        format=ext.lstrip("."),
        metadata={"language": language, "encoding": "utf-8"},
        char_count=len(content),
        parse_warnings=[],
    )

def _format_with_line_numbers(self, content: str, file_path: str) -> str:
    """Format content with file header and line numbers."""
    lines = content.split("\n")
    total_lines = len(lines)
    # Calculate padding width (at least 1 digit)
    width = len(str(total_lines)) if total_lines > 0 else 1

    formatted_lines = [f"=== FILE: {file_path} ==="]
    for i, line in enumerate(lines, start=1):
        formatted_lines.append(f"{i:>{width}}| {line}")

    return "\n".join(formatted_lines)
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/parser/test_code.py -v`
Expected: PASS (all tests including new ones)

**Step 5: Commit**

```bash
git add src/shesha/parser/code.py tests/unit/parser/test_code.py
git commit -m "feat(parser): add line number formatting to CodeParser"
```

---

## Task 6: Add Encoding Detection to CodeParser

**Files:**
- Modify: `src/shesha/parser/code.py`
- Modify: `tests/unit/parser/test_code.py`

**Step 1: Write failing test for encoding detection**

Add to `tests/unit/parser/test_code.py`:

```python
    def test_parse_non_utf8_file(self, parser: CodeParser, tmp_path: Path):
        """CodeParser handles non-UTF-8 files via chardet."""
        # Create a Latin-1 encoded file
        content = "# Comment with accent: caf\xe9"
        test_file = tmp_path / "latin1.py"
        test_file.write_bytes(content.encode("latin-1"))

        doc = parser.parse(test_file)
        assert "caf" in doc.content  # Should decode successfully
        assert doc.metadata["encoding"] in ["latin-1", "ISO-8859-1", "Windows-1252"]
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/parser/test_code.py::TestCodeParser::test_parse_non_utf8_file -v`
Expected: FAIL (UnicodeDecodeError or wrong encoding)

**Step 3: Write minimal implementation**

Update `src/shesha/parser/code.py`:

```python
"""Code file parser for source code files."""

from pathlib import Path

import chardet

from shesha.models import ParsedDocument

# ... EXTENSION_TO_LANGUAGE dict unchanged ...


class CodeParser:
    """Parser for source code files."""

    def can_parse(self, path: Path, mime_type: str | None = None) -> bool:
        """Check if this parser can handle the given file."""
        return path.suffix.lower() in EXTENSION_TO_LANGUAGE

    def parse(
        self,
        path: Path,
        include_line_numbers: bool = False,
        file_path: str | None = None,
    ) -> ParsedDocument:
        """Parse a code file and return a ParsedDocument."""
        content, encoding = self._read_with_encoding_detection(path)
        ext = path.suffix.lower()
        language = EXTENSION_TO_LANGUAGE.get(ext, "unknown")

        if include_line_numbers:
            display_path = file_path or path.name
            content = self._format_with_line_numbers(content, display_path)

        return ParsedDocument(
            name=path.name,
            content=content,
            format=ext.lstrip("."),
            metadata={"language": language, "encoding": encoding},
            char_count=len(content),
            parse_warnings=[],
        )

    def _read_with_encoding_detection(self, path: Path) -> tuple[str, str]:
        """Read file with automatic encoding detection."""
        raw_bytes = path.read_bytes()

        # Try UTF-8 first (most common)
        try:
            return raw_bytes.decode("utf-8"), "utf-8"
        except UnicodeDecodeError:
            pass

        # Fall back to chardet detection
        detected = chardet.detect(raw_bytes)
        encoding = detected.get("encoding") or "utf-8"

        try:
            return raw_bytes.decode(encoding), encoding
        except (UnicodeDecodeError, LookupError):
            # Last resort: decode with errors replaced
            return raw_bytes.decode("utf-8", errors="replace"), "utf-8"

    def _format_with_line_numbers(self, content: str, file_path: str) -> str:
        """Format content with file header and line numbers."""
        lines = content.split("\n")
        total_lines = len(lines)
        width = len(str(total_lines)) if total_lines > 0 else 1

        formatted_lines = [f"=== FILE: {file_path} ==="]
        for i, line in enumerate(lines, start=1):
            formatted_lines.append(f"{i:>{width}}| {line}")

        return "\n".join(formatted_lines)
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/parser/test_code.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/parser/code.py tests/unit/parser/test_code.py
git commit -m "feat(parser): add chardet encoding detection to CodeParser"
```

---

## Task 7: Add Shebang Detection for Extensionless Files

**Files:**
- Modify: `src/shesha/parser/code.py`
- Modify: `tests/unit/parser/test_code.py`

**Step 1: Write failing tests for shebang detection**

Add to `tests/unit/parser/test_code.py`:

```python
    def test_can_parse_extensionless_with_shebang(self, parser: CodeParser, tmp_path: Path):
        """CodeParser can parse extensionless files with shebangs."""
        test_file = tmp_path / "myscript"
        test_file.write_text("#!/bin/bash\necho hello")

        assert parser.can_parse(test_file)

    def test_parse_bash_shebang(self, parser: CodeParser, tmp_path: Path):
        """CodeParser detects bash from shebang."""
        test_file = tmp_path / "myscript"
        test_file.write_text("#!/bin/bash\necho hello")

        doc = parser.parse(test_file)
        assert doc.metadata["language"] == "bash"

    def test_parse_python_env_shebang(self, parser: CodeParser, tmp_path: Path):
        """CodeParser detects python from env shebang."""
        test_file = tmp_path / "myscript"
        test_file.write_text("#!/usr/bin/env python3\nprint('hello')")

        doc = parser.parse(test_file)
        assert doc.metadata["language"] == "python"

    def test_cannot_parse_binary_extensionless(self, parser: CodeParser, tmp_path: Path):
        """CodeParser rejects binary extensionless files."""
        test_file = tmp_path / "binary"
        test_file.write_bytes(b"\x00\x01\x02\x03\xff\xfe")

        assert not parser.can_parse(test_file)
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/parser/test_code.py::TestCodeParser::test_can_parse_extensionless_with_shebang -v`
Expected: FAIL (returns False)

**Step 3: Write minimal implementation**

Update `src/shesha/parser/code.py`:

```python
# Add shebang-to-language mapping
SHEBANG_TO_LANGUAGE = {
    "bash": "bash",
    "sh": "bash",
    "zsh": "zsh",
    "python": "python",
    "python3": "python",
    "ruby": "ruby",
    "perl": "perl",
    "node": "javascript",
    "php": "php",
}


class CodeParser:
    """Parser for source code files."""

    def can_parse(self, path: Path, mime_type: str | None = None) -> bool:
        """Check if this parser can handle the given file."""
        # Check extension first
        if path.suffix.lower() in EXTENSION_TO_LANGUAGE:
            return True

        # Check for extensionless files with shebangs
        if not path.suffix:
            return self._has_valid_shebang(path)

        return False

    def _has_valid_shebang(self, path: Path) -> bool:
        """Check if file has a valid shebang line (and is not binary)."""
        try:
            # Read first 512 bytes to check for binary content and shebang
            with open(path, "rb") as f:
                header = f.read(512)

            # Check for binary content (null bytes)
            if b"\x00" in header:
                return False

            # Check for shebang
            first_line = header.split(b"\n")[0].decode("utf-8", errors="ignore")
            if first_line.startswith("#!"):
                return self._parse_shebang(first_line) is not None

            return False
        except (OSError, IOError):
            return False

    def _parse_shebang(self, shebang_line: str) -> str | None:
        """Extract language from shebang line."""
        # Examples: #!/bin/bash, #!/usr/bin/env python3
        parts = shebang_line[2:].strip().split()
        if not parts:
            return None

        # Handle /usr/bin/env style
        if parts[0].endswith("/env") and len(parts) > 1:
            interpreter = parts[1]
        else:
            interpreter = parts[0].split("/")[-1]

        # Strip version numbers (python3 -> python)
        base_interpreter = interpreter.rstrip("0123456789.")

        return SHEBANG_TO_LANGUAGE.get(base_interpreter)

    def parse(
        self,
        path: Path,
        include_line_numbers: bool = False,
        file_path: str | None = None,
    ) -> ParsedDocument:
        """Parse a code file and return a ParsedDocument."""
        content, encoding = self._read_with_encoding_detection(path)
        ext = path.suffix.lower()

        # Determine language
        if ext in EXTENSION_TO_LANGUAGE:
            language = EXTENSION_TO_LANGUAGE[ext]
        else:
            # Try shebang detection for extensionless files
            first_line = content.split("\n")[0] if content else ""
            language = self._parse_shebang(first_line) or "unknown"

        # Determine format
        if ext:
            format_str = ext.lstrip(".")
        else:
            format_str = language if language != "unknown" else "text"

        if include_line_numbers:
            display_path = file_path or path.name
            content = self._format_with_line_numbers(content, display_path)

        return ParsedDocument(
            name=path.name,
            content=content,
            format=format_str,
            metadata={"language": language, "encoding": encoding},
            char_count=len(content),
            parse_warnings=[],
        )

    # ... rest of methods unchanged ...
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/parser/test_code.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/parser/code.py tests/unit/parser/test_code.py
git commit -m "feat(parser): add shebang detection for extensionless files"
```

---

## Task 8: Create RepoIngester Class - Basic Structure

**Files:**
- Create: `src/shesha/repo/__init__.py`
- Create: `src/shesha/repo/ingester.py`
- Create: `tests/unit/repo/__init__.py`
- Create: `tests/unit/repo/test_ingester.py`

**Step 1: Write failing test for basic RepoIngester**

Create `tests/unit/repo/__init__.py` (empty file).

Create `tests/unit/repo/test_ingester.py`:

```python
"""Tests for RepoIngester."""

from pathlib import Path

import pytest

from shesha.repo.ingester import RepoIngester


@pytest.fixture
def ingester(tmp_path: Path) -> RepoIngester:
    return RepoIngester(storage_path=tmp_path)


class TestRepoIngester:
    """Tests for RepoIngester class."""

    def test_init_creates_repos_dir(self, ingester: RepoIngester, tmp_path: Path):
        """RepoIngester creates repos directory on init."""
        assert (tmp_path / "repos").is_dir()

    def test_is_local_path_absolute(self, ingester: RepoIngester):
        """is_local_path returns True for absolute paths."""
        assert ingester.is_local_path("/home/user/repo")

    def test_is_local_path_home(self, ingester: RepoIngester):
        """is_local_path returns True for home-relative paths."""
        assert ingester.is_local_path("~/projects/repo")

    def test_is_local_path_url(self, ingester: RepoIngester):
        """is_local_path returns False for URLs."""
        assert not ingester.is_local_path("https://github.com/org/repo")
        assert not ingester.is_local_path("git@github.com:org/repo.git")
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/repo/test_ingester.py -v`
Expected: FAIL (ModuleNotFoundError)

**Step 3: Write minimal implementation**

Create `src/shesha/repo/__init__.py`:

```python
"""Repository ingestion module."""

from shesha.repo.ingester import RepoIngester

__all__ = ["RepoIngester"]
```

Create `src/shesha/repo/ingester.py`:

```python
"""Git repository ingester."""

from pathlib import Path


class RepoIngester:
    """Handles git repository cloning, updating, and file extraction."""

    def __init__(self, storage_path: Path | str) -> None:
        """Initialize with storage path for cloned repos."""
        self.storage_path = Path(storage_path)
        self.repos_dir = self.storage_path / "repos"
        self.repos_dir.mkdir(parents=True, exist_ok=True)

    def is_local_path(self, url: str) -> bool:
        """Check if url is a local filesystem path."""
        return (
            url.startswith("/")
            or url.startswith("~")
            or Path(url).exists()
        )
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/repo/test_ingester.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/repo/ tests/unit/repo/
git commit -m "feat(repo): add RepoIngester class skeleton"
```

---

## Task 9: Add Host Detection to RepoIngester

**Files:**
- Modify: `src/shesha/repo/ingester.py`
- Modify: `tests/unit/repo/test_ingester.py`

**Step 1: Write failing tests for host detection**

Add to `tests/unit/repo/test_ingester.py`:

```python
    def test_detect_host_github(self, ingester: RepoIngester):
        """detect_host identifies GitHub URLs."""
        assert ingester.detect_host("https://github.com/org/repo") == "github.com"
        assert ingester.detect_host("git@github.com:org/repo.git") == "github.com"

    def test_detect_host_gitlab(self, ingester: RepoIngester):
        """detect_host identifies GitLab URLs."""
        assert ingester.detect_host("https://gitlab.com/org/repo") == "gitlab.com"

    def test_detect_host_bitbucket(self, ingester: RepoIngester):
        """detect_host identifies Bitbucket URLs."""
        assert ingester.detect_host("https://bitbucket.org/org/repo") == "bitbucket.org"

    def test_detect_host_local(self, ingester: RepoIngester):
        """detect_host returns None for local paths."""
        assert ingester.detect_host("/home/user/repo") is None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/repo/test_ingester.py::TestRepoIngester::test_detect_host_github -v`
Expected: FAIL (AttributeError - no detect_host method)

**Step 3: Write minimal implementation**

Add to `src/shesha/repo/ingester.py`:

```python
import re
from urllib.parse import urlparse


class RepoIngester:
    # ... existing code ...

    def detect_host(self, url: str) -> str | None:
        """Detect the git host from a URL."""
        if self.is_local_path(url):
            return None

        # Handle SSH URLs (git@github.com:org/repo.git)
        ssh_match = re.match(r"git@([^:]+):", url)
        if ssh_match:
            return ssh_match.group(1)

        # Handle HTTPS URLs
        parsed = urlparse(url)
        if parsed.netloc:
            return parsed.netloc

        return None
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/repo/test_ingester.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/repo/ingester.py tests/unit/repo/test_ingester.py
git commit -m "feat(repo): add host detection to RepoIngester"
```

---

## Task 10: Add Token Resolution to RepoIngester

**Files:**
- Modify: `src/shesha/repo/ingester.py`
- Modify: `tests/unit/repo/test_ingester.py`

**Step 1: Write failing tests for token resolution**

Add to `tests/unit/repo/test_ingester.py`:

```python
import os
from unittest.mock import patch


class TestTokenResolution:
    """Tests for token resolution logic."""

    def test_explicit_token_takes_precedence(self, ingester: RepoIngester):
        """Explicit token parameter wins over env vars."""
        with patch.dict(os.environ, {"GITHUB_TOKEN": "env_token"}):
            token = ingester.resolve_token(
                url="https://github.com/org/repo",
                explicit_token="explicit_token",
            )
            assert token == "explicit_token"

    def test_github_env_token(self, ingester: RepoIngester):
        """GITHUB_TOKEN env var used for github.com."""
        with patch.dict(os.environ, {"GITHUB_TOKEN": "gh_token"}, clear=True):
            token = ingester.resolve_token(
                url="https://github.com/org/repo",
                explicit_token=None,
            )
            assert token == "gh_token"

    def test_gitlab_env_token(self, ingester: RepoIngester):
        """GITLAB_TOKEN env var used for gitlab.com."""
        with patch.dict(os.environ, {"GITLAB_TOKEN": "gl_token"}, clear=True):
            token = ingester.resolve_token(
                url="https://gitlab.com/org/repo",
                explicit_token=None,
            )
            assert token == "gl_token"

    def test_no_token_returns_none(self, ingester: RepoIngester):
        """Returns None when no token available."""
        with patch.dict(os.environ, {}, clear=True):
            token = ingester.resolve_token(
                url="https://github.com/org/repo",
                explicit_token=None,
            )
            assert token is None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/repo/test_ingester.py::TestTokenResolution -v`
Expected: FAIL (AttributeError - no resolve_token method)

**Step 3: Write minimal implementation**

Add to `src/shesha/repo/ingester.py`:

```python
import os


class RepoIngester:
    # Host to environment variable mapping
    HOST_TO_ENV_VAR = {
        "github.com": "GITHUB_TOKEN",
        "gitlab.com": "GITLAB_TOKEN",
        "bitbucket.org": "BITBUCKET_TOKEN",
    }

    # ... existing code ...

    def resolve_token(self, url: str, explicit_token: str | None) -> str | None:
        """Resolve authentication token for a URL.

        Priority: explicit token > env var > None (system git auth)
        """
        if explicit_token:
            return explicit_token

        host = self.detect_host(url)
        if host and host in self.HOST_TO_ENV_VAR:
            env_var = self.HOST_TO_ENV_VAR[host]
            return os.environ.get(env_var)

        return None
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/repo/test_ingester.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/repo/ingester.py tests/unit/repo/test_ingester.py
git commit -m "feat(repo): add token resolution to RepoIngester"
```

---

## Task 11: Add Git Clone to RepoIngester

**Files:**
- Modify: `src/shesha/repo/ingester.py`
- Modify: `tests/unit/repo/test_ingester.py`

**Step 1: Write failing tests for git clone**

Add to `tests/unit/repo/test_ingester.py`:

```python
from unittest.mock import MagicMock, patch

from shesha.exceptions import AuthenticationError, RepoIngestError


class TestGitClone:
    """Tests for git clone functionality."""

    def test_clone_creates_project_dir(self, ingester: RepoIngester, tmp_path: Path):
        """clone() creates directory for the project."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stderr="")

            ingester.clone(
                url="https://github.com/org/repo",
                project_id="my-project",
            )

            assert (tmp_path / "repos" / "my-project").is_dir()

    def test_clone_uses_depth_1(self, ingester: RepoIngester):
        """clone() uses shallow clone (depth=1)."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stderr="")

            ingester.clone(
                url="https://github.com/org/repo",
                project_id="my-project",
            )

            # Check that --depth=1 was in the command
            call_args = mock_run.call_args[0][0]
            assert "--depth=1" in call_args

    def test_clone_injects_token_into_url(self, ingester: RepoIngester):
        """clone() injects token into HTTPS URL."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stderr="")

            ingester.clone(
                url="https://github.com/org/repo",
                project_id="my-project",
                token="my_token",
            )

            call_args = mock_run.call_args[0][0]
            # Find the URL in the command
            url_in_cmd = [a for a in call_args if "github.com" in a][0]
            assert "my_token@github.com" in url_in_cmd

    def test_clone_auth_failure_raises(self, ingester: RepoIngester):
        """clone() raises AuthenticationError on auth failure."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=128,
                stderr="fatal: Authentication failed",
            )

            with pytest.raises(AuthenticationError):
                ingester.clone(
                    url="https://github.com/org/private-repo",
                    project_id="my-project",
                )

    def test_clone_other_failure_raises(self, ingester: RepoIngester):
        """clone() raises RepoIngestError on other failures."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=128,
                stderr="fatal: repository not found",
            )

            with pytest.raises(RepoIngestError):
                ingester.clone(
                    url="https://github.com/org/nonexistent",
                    project_id="my-project",
                )
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/repo/test_ingester.py::TestGitClone -v`
Expected: FAIL (AttributeError - no clone method)

**Step 3: Write minimal implementation**

Add to `src/shesha/repo/ingester.py`:

```python
import subprocess
from urllib.parse import urlparse, urlunparse

from shesha.exceptions import AuthenticationError, RepoIngestError


class RepoIngester:
    # ... existing code ...

    def clone(
        self,
        url: str,
        project_id: str,
        token: str | None = None,
    ) -> Path:
        """Clone a git repository.

        Args:
            url: Repository URL (HTTPS or SSH).
            project_id: ID for storing the repo.
            token: Optional auth token (injected into HTTPS URLs).

        Returns:
            Path to the cloned repository.

        Raises:
            AuthenticationError: If authentication fails.
            RepoIngestError: If clone fails for other reasons.
        """
        repo_path = self.repos_dir / project_id
        repo_path.mkdir(parents=True, exist_ok=True)

        clone_url = self._inject_token(url, token) if token else url

        result = subprocess.run(
            ["git", "clone", "--depth=1", clone_url, str(repo_path)],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            # Clean up failed clone
            if repo_path.exists():
                import shutil
                shutil.rmtree(repo_path)

            if "Authentication failed" in result.stderr:
                raise AuthenticationError(url)
            raise RepoIngestError(url, RuntimeError(result.stderr))

        return repo_path

    def _inject_token(self, url: str, token: str) -> str:
        """Inject auth token into HTTPS URL."""
        parsed = urlparse(url)
        if parsed.scheme in ("http", "https"):
            # Insert token as username: https://token@github.com/...
            netloc = f"{token}@{parsed.netloc}"
            return urlunparse(parsed._replace(netloc=netloc))
        return url
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/repo/test_ingester.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/repo/ingester.py tests/unit/repo/test_ingester.py
git commit -m "feat(repo): add git clone to RepoIngester"
```

---

## Task 12: Add SHA Tracking to RepoIngester

**Files:**
- Modify: `src/shesha/repo/ingester.py`
- Modify: `tests/unit/repo/test_ingester.py`

**Step 1: Write failing tests for SHA tracking**

Add to `tests/unit/repo/test_ingester.py`:

```python
import json


class TestSHATracking:
    """Tests for SHA tracking functionality."""

    def test_save_sha_creates_file(self, ingester: RepoIngester, tmp_path: Path):
        """save_sha() creates metadata file with SHA."""
        ingester.save_sha("my-project", "abc123def456")

        meta_path = tmp_path / "repos" / "my-project" / "_repo_meta.json"
        assert meta_path.exists()
        data = json.loads(meta_path.read_text())
        assert data["head_sha"] == "abc123def456"

    def test_get_saved_sha(self, ingester: RepoIngester, tmp_path: Path):
        """get_saved_sha() returns stored SHA."""
        # Set up metadata
        (tmp_path / "repos" / "my-project").mkdir(parents=True)
        meta_path = tmp_path / "repos" / "my-project" / "_repo_meta.json"
        meta_path.write_text(json.dumps({"head_sha": "abc123"}))

        sha = ingester.get_saved_sha("my-project")
        assert sha == "abc123"

    def test_get_saved_sha_missing_returns_none(self, ingester: RepoIngester):
        """get_saved_sha() returns None if no metadata."""
        sha = ingester.get_saved_sha("nonexistent-project")
        assert sha is None

    def test_get_remote_sha(self, ingester: RepoIngester):
        """get_remote_sha() calls git ls-remote."""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="abc123def456789\tHEAD\n",
            )

            sha = ingester.get_remote_sha("https://github.com/org/repo")
            assert sha == "abc123def456789"
            assert "ls-remote" in mock_run.call_args[0][0]

    def test_get_local_sha(self, ingester: RepoIngester, tmp_path: Path):
        """get_local_sha() returns HEAD SHA from local repo."""
        # Set up fake git repo
        repo_path = tmp_path / "repos" / "my-project"
        repo_path.mkdir(parents=True)

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="abc123def456789\n",
            )

            sha = ingester.get_local_sha("my-project")
            assert sha == "abc123def456789"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/repo/test_ingester.py::TestSHATracking -v`
Expected: FAIL (AttributeError)

**Step 3: Write minimal implementation**

Add to `src/shesha/repo/ingester.py`:

```python
import json


class RepoIngester:
    # ... existing code ...

    def save_sha(self, project_id: str, sha: str) -> None:
        """Save the HEAD SHA for a project."""
        repo_path = self.repos_dir / project_id
        repo_path.mkdir(parents=True, exist_ok=True)
        meta_path = repo_path / "_repo_meta.json"
        meta_path.write_text(json.dumps({"head_sha": sha}))

    def get_saved_sha(self, project_id: str) -> str | None:
        """Get the saved HEAD SHA for a project."""
        meta_path = self.repos_dir / project_id / "_repo_meta.json"
        if not meta_path.exists():
            return None
        data = json.loads(meta_path.read_text())
        return data.get("head_sha")

    def get_remote_sha(self, url: str, token: str | None = None) -> str | None:
        """Get the HEAD SHA from remote repository."""
        cmd = ["git", "ls-remote", url, "HEAD"]
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            return None

        # Output format: "sha\tHEAD\n"
        parts = result.stdout.strip().split()
        return parts[0] if parts else None

    def get_local_sha(self, project_id: str) -> str | None:
        """Get the HEAD SHA from a local cloned repo."""
        repo_path = self.repos_dir / project_id
        if not repo_path.exists():
            return None

        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=repo_path,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            return None

        return result.stdout.strip()
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/repo/test_ingester.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/repo/ingester.py tests/unit/repo/test_ingester.py
git commit -m "feat(repo): add SHA tracking to RepoIngester"
```

---

## Task 13: Add File Listing to RepoIngester

**Files:**
- Modify: `src/shesha/repo/ingester.py`
- Modify: `tests/unit/repo/test_ingester.py`

**Step 1: Write failing tests for file listing**

Add to `tests/unit/repo/test_ingester.py`:

```python
class TestFileListing:
    """Tests for file listing functionality."""

    def test_list_files_uses_git_ls_files(self, ingester: RepoIngester, tmp_path: Path):
        """list_files() uses git ls-files."""
        repo_path = tmp_path / "repos" / "my-project"
        repo_path.mkdir(parents=True)

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="src/main.py\nREADME.md\ntests/test_main.py\n",
            )

            files = ingester.list_files("my-project")
            assert files == ["src/main.py", "README.md", "tests/test_main.py"]

    def test_list_files_with_subdirectory(self, ingester: RepoIngester, tmp_path: Path):
        """list_files() filters to subdirectory when specified."""
        repo_path = tmp_path / "repos" / "my-project"
        repo_path.mkdir(parents=True)

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="src/main.py\nsrc/utils.py\n",
            )

            files = ingester.list_files("my-project", subdir="src/")

            # Verify git ls-files was called with subdir
            call_args = mock_run.call_args[0][0]
            assert "src/" in call_args

    def test_list_files_empty_repo(self, ingester: RepoIngester, tmp_path: Path):
        """list_files() returns empty list for empty repo."""
        repo_path = tmp_path / "repos" / "my-project"
        repo_path.mkdir(parents=True)

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout="")

            files = ingester.list_files("my-project")
            assert files == []
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/repo/test_ingester.py::TestFileListing -v`
Expected: FAIL (AttributeError)

**Step 3: Write minimal implementation**

Add to `src/shesha/repo/ingester.py`:

```python
class RepoIngester:
    # ... existing code ...

    def list_files(self, project_id: str, subdir: str | None = None) -> list[str]:
        """List tracked files in a cloned repository.

        Args:
            project_id: ID of the cloned repo.
            subdir: Optional subdirectory to filter to.

        Returns:
            List of relative file paths.
        """
        repo_path = self.repos_dir / project_id

        cmd = ["git", "ls-files"]
        if subdir:
            cmd.append(subdir)

        result = subprocess.run(
            cmd,
            cwd=repo_path,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            return []

        files = result.stdout.strip().split("\n")
        return [f for f in files if f]  # Filter empty strings
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/repo/test_ingester.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/repo/ingester.py tests/unit/repo/test_ingester.py
git commit -m "feat(repo): add file listing to RepoIngester"
```

---

## Task 14: Add Git Fetch/Pull to RepoIngester

**Files:**
- Modify: `src/shesha/repo/ingester.py`
- Modify: `tests/unit/repo/test_ingester.py`

**Step 1: Write failing tests for fetch/pull**

Add to `tests/unit/repo/test_ingester.py`:

```python
class TestGitFetchPull:
    """Tests for git fetch and pull functionality."""

    def test_fetch_calls_git_fetch(self, ingester: RepoIngester, tmp_path: Path):
        """fetch() calls git fetch."""
        repo_path = tmp_path / "repos" / "my-project"
        repo_path.mkdir(parents=True)

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)

            ingester.fetch("my-project")

            call_args = mock_run.call_args[0][0]
            assert "fetch" in call_args

    def test_pull_calls_git_pull(self, ingester: RepoIngester, tmp_path: Path):
        """pull() calls git pull."""
        repo_path = tmp_path / "repos" / "my-project"
        repo_path.mkdir(parents=True)

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)

            ingester.pull("my-project")

            call_args = mock_run.call_args[0][0]
            assert "pull" in call_args

    def test_pull_failure_raises(self, ingester: RepoIngester, tmp_path: Path):
        """pull() raises RepoIngestError on failure."""
        repo_path = tmp_path / "repos" / "my-project"
        repo_path.mkdir(parents=True)

        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=1,
                stderr="merge conflict",
            )

            with pytest.raises(RepoIngestError):
                ingester.pull("my-project")
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/repo/test_ingester.py::TestGitFetchPull -v`
Expected: FAIL (AttributeError)

**Step 3: Write minimal implementation**

Add to `src/shesha/repo/ingester.py`:

```python
class RepoIngester:
    # ... existing code ...

    def fetch(self, project_id: str) -> None:
        """Fetch updates from remote."""
        repo_path = self.repos_dir / project_id

        subprocess.run(
            ["git", "fetch", "origin"],
            cwd=repo_path,
            capture_output=True,
        )

    def pull(self, project_id: str) -> None:
        """Pull updates from remote.

        Raises:
            RepoIngestError: If pull fails.
        """
        repo_path = self.repos_dir / project_id
        url = f"repo at {repo_path}"

        result = subprocess.run(
            ["git", "pull", "--ff-only"],
            cwd=repo_path,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            raise RepoIngestError(url, RuntimeError(result.stderr))
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/repo/test_ingester.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/repo/ingester.py tests/unit/repo/test_ingester.py
git commit -m "feat(repo): add git fetch/pull to RepoIngester"
```

---

## Task 15: Add create_project_from_repo to Shesha Class

**Files:**
- Modify: `src/shesha/shesha.py`
- Modify: `tests/unit/test_shesha.py`

**Step 1: Write failing tests for create_project_from_repo**

Add to `tests/unit/test_shesha.py`:

```python
from shesha.models import RepoProjectResult


class TestCreateProjectFromRepo:
    """Tests for create_project_from_repo method."""

    def test_creates_new_project(self, tmp_path: Path):
        """create_project_from_repo creates project for new repo."""
        with patch("shesha.shesha.ContainerPool"):
            with patch("shesha.shesha.RepoIngester") as MockIngester:
                mock_ingester = MagicMock()
                MockIngester.return_value = mock_ingester

                # Set up mock behaviors
                mock_ingester.is_local_path.return_value = True
                mock_ingester.get_saved_sha.return_value = None
                mock_ingester.get_local_sha.return_value = "abc123"
                mock_ingester.list_files.return_value = ["src/main.py"]

                shesha = Shesha(model="test-model", storage_path=tmp_path)

                # Mock the file reading
                with patch("pathlib.Path.read_text", return_value="print('hello')"):
                    result = shesha.create_project_from_repo(
                        url="/path/to/local/repo",
                        name="my-project",
                    )

                assert isinstance(result, RepoProjectResult)
                assert result.status == "created"
                assert result.project.project_id == "my-project"

    def test_unchanged_when_sha_matches(self, tmp_path: Path):
        """create_project_from_repo returns unchanged when SHAs match."""
        with patch("shesha.shesha.ContainerPool"):
            with patch("shesha.shesha.RepoIngester") as MockIngester:
                mock_ingester = MagicMock()
                MockIngester.return_value = mock_ingester

                mock_ingester.is_local_path.return_value = False
                mock_ingester.get_saved_sha.return_value = "abc123"
                mock_ingester.get_remote_sha.return_value = "abc123"

                shesha = Shesha(model="test-model", storage_path=tmp_path)

                # Create existing project
                shesha._storage.create_project("my-project")

                result = shesha.create_project_from_repo(
                    url="https://github.com/org/repo",
                    name="my-project",
                )

                assert result.status == "unchanged"

    def test_updates_available_when_sha_differs(self, tmp_path: Path):
        """create_project_from_repo returns updates_available when SHAs differ."""
        with patch("shesha.shesha.ContainerPool"):
            with patch("shesha.shesha.RepoIngester") as MockIngester:
                mock_ingester = MagicMock()
                MockIngester.return_value = mock_ingester

                mock_ingester.is_local_path.return_value = False
                mock_ingester.get_saved_sha.return_value = "abc123"
                mock_ingester.get_remote_sha.return_value = "def456"

                shesha = Shesha(model="test-model", storage_path=tmp_path)

                # Create existing project
                shesha._storage.create_project("my-project")

                result = shesha.create_project_from_repo(
                    url="https://github.com/org/repo",
                    name="my-project",
                )

                assert result.status == "updates_available"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_shesha.py::TestCreateProjectFromRepo -v`
Expected: FAIL (AttributeError - no create_project_from_repo method)

**Step 3: Write minimal implementation**

Update `src/shesha/shesha.py`:

```python
# Add imports at top
from shesha.models import ParsedDocument, RepoProjectResult
from shesha.repo.ingester import RepoIngester


class Shesha:
    def __init__(self, ...):
        # ... existing init code ...

        # Add repo ingester
        self._repo_ingester = RepoIngester(storage_path=config.storage_path)

    # ... existing methods ...

    def create_project_from_repo(
        self,
        url: str,
        name: str | None = None,
        token: str | None = None,
        path: str | None = None,
    ) -> RepoProjectResult:
        """Create a project from a git repository.

        Args:
            url: Repository URL or local path.
            name: Project name (defaults to repo name from URL).
            token: Auth token for private repos.
            path: Subdirectory to ingest (for monorepos).

        Returns:
            RepoProjectResult with project and status.
        """
        # Derive project name from URL if not provided
        if name is None:
            name = self._extract_repo_name(url)

        # Resolve token
        resolved_token = self._repo_ingester.resolve_token(url, token)

        # Check if project exists and compare SHA
        if self._storage.project_exists(name):
            return self._handle_existing_project(url, name, resolved_token, path)

        return self._create_new_project_from_repo(url, name, resolved_token, path)

    def _extract_repo_name(self, url: str) -> str:
        """Extract repository name from URL."""
        # Handle local paths
        if self._repo_ingester.is_local_path(url):
            return Path(url).expanduser().name

        # Handle URLs
        import re
        # Match org/repo or org/repo.git
        match = re.search(r"[/:]([^/]+/[^/]+?)(?:\.git)?$", url)
        if match:
            return match.group(1).replace("/", "-")
        return "unnamed-repo"

    def _handle_existing_project(
        self,
        url: str,
        name: str,
        token: str | None,
        path: str | None,
    ) -> RepoProjectResult:
        """Handle create_project_from_repo for existing project."""
        saved_sha = self._repo_ingester.get_saved_sha(name)

        if self._repo_ingester.is_local_path(url):
            current_sha = self._repo_ingester.get_local_sha(name)
        else:
            current_sha = self._repo_ingester.get_remote_sha(url, token)

        project = self.get_project(name)

        if saved_sha == current_sha:
            return RepoProjectResult(
                project=project,
                status="unchanged",
                files_ingested=len(self._storage.list_documents(name)),
            )

        # Updates available
        def apply_updates() -> RepoProjectResult:
            self._repo_ingester.pull(name)
            return self._ingest_repo(url, name, token, path, is_update=True)

        return RepoProjectResult(
            project=project,
            status="updates_available",
            files_ingested=len(self._storage.list_documents(name)),
            _apply_updates_fn=apply_updates,
        )

    def _create_new_project_from_repo(
        self,
        url: str,
        name: str,
        token: str | None,
        path: str | None,
    ) -> RepoProjectResult:
        """Create a new project from repo."""
        # Clone if remote
        if not self._repo_ingester.is_local_path(url):
            self._repo_ingester.clone(url, name, token)

        return self._ingest_repo(url, name, token, path, is_update=False)

    def _ingest_repo(
        self,
        url: str,
        name: str,
        token: str | None,
        path: str | None,
        is_update: bool,
    ) -> RepoProjectResult:
        """Ingest files from repository into project."""
        # Create project if new
        if not is_update:
            self._storage.create_project(name)

        # Get repo path
        if self._repo_ingester.is_local_path(url):
            repo_path = Path(url).expanduser()
        else:
            repo_path = self._repo_ingester.repos_dir / name

        # List and parse files
        files = self._repo_ingester.list_files(name, subdir=path)
        files_ingested = 0
        files_skipped = 0
        warnings: list[str] = []

        for file_path in files:
            full_path = repo_path / file_path
            try:
                parser = self._parser_registry.find_parser(full_path)
                if parser is None:
                    files_skipped += 1
                    continue

                doc = parser.parse(
                    full_path,
                    include_line_numbers=True,
                    file_path=file_path,
                )
                # Use file_path as doc name for unique identification
                doc = ParsedDocument(
                    name=file_path,
                    content=doc.content,
                    format=doc.format,
                    metadata=doc.metadata,
                    char_count=doc.char_count,
                    parse_warnings=doc.parse_warnings,
                )
                self._storage.store_document(name, doc)
                files_ingested += 1
            except Exception as e:
                files_skipped += 1
                warnings.append(f"Failed to parse {file_path}: {e}")

        # Save SHA
        if self._repo_ingester.is_local_path(url):
            sha = self._repo_ingester.get_local_sha(name)
        else:
            sha = self._repo_ingester.get_local_sha(name)

        if sha:
            self._repo_ingester.save_sha(name, sha)

        project = self.get_project(name)

        return RepoProjectResult(
            project=project,
            status="created",
            files_ingested=files_ingested,
            files_skipped=files_skipped,
            warnings=warnings,
        )
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_shesha.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/shesha.py tests/unit/test_shesha.py
git commit -m "feat: add create_project_from_repo to Shesha class"
```

---

## Task 16: Add Integration Test with Local Git Repo

**Files:**
- Create: `tests/integration/__init__.py`
- Create: `tests/integration/test_repo_ingestion.py`
- Create: `tests/fixtures/sample_repo/` (fixture setup)

**Step 1: Create test fixtures**

Create `tests/integration/__init__.py` (empty file).

Create `tests/fixtures/sample_repo/.gitkeep` (placeholder).

**Step 2: Write integration test**

Create `tests/integration/test_repo_ingestion.py`:

```python
"""Integration tests for repository ingestion."""

import subprocess
from pathlib import Path
from unittest.mock import patch

import pytest

from shesha import Shesha


@pytest.fixture
def sample_git_repo(tmp_path: Path) -> Path:
    """Create a sample git repository for testing."""
    repo_path = tmp_path / "sample-repo"
    repo_path.mkdir()

    # Initialize git repo
    subprocess.run(["git", "init"], cwd=repo_path, capture_output=True)
    subprocess.run(
        ["git", "config", "user.email", "test@test.com"],
        cwd=repo_path,
        capture_output=True,
    )
    subprocess.run(
        ["git", "config", "user.name", "Test"],
        cwd=repo_path,
        capture_output=True,
    )

    # Create some files
    (repo_path / "src").mkdir()
    (repo_path / "src" / "main.py").write_text(
        "def main():\n    print('Hello')\n\nif __name__ == '__main__':\n    main()\n"
    )
    (repo_path / "README.md").write_text("# Sample Repo\n\nA test repository.\n")
    (repo_path / "Makefile").write_text("all:\n\tpython src/main.py\n")

    # Commit
    subprocess.run(["git", "add", "."], cwd=repo_path, capture_output=True)
    subprocess.run(
        ["git", "commit", "-m", "Initial commit"],
        cwd=repo_path,
        capture_output=True,
    )

    return repo_path


class TestRepoIngestion:
    """Integration tests for create_project_from_repo."""

    def test_ingest_local_repo(self, sample_git_repo: Path, tmp_path: Path):
        """Can ingest a local git repository."""
        storage_path = tmp_path / "shesha-storage"

        with patch("shesha.shesha.ContainerPool"):
            shesha = Shesha(model="test-model", storage_path=storage_path)

            result = shesha.create_project_from_repo(
                url=str(sample_git_repo),
                name="sample-project",
            )

            assert result.status == "created"
            assert result.files_ingested >= 2  # At least main.py and README.md
            assert result.project.project_id == "sample-project"

    def test_ingest_with_line_numbers(self, sample_git_repo: Path, tmp_path: Path):
        """Ingested files have line numbers."""
        storage_path = tmp_path / "shesha-storage"

        with patch("shesha.shesha.ContainerPool"):
            shesha = Shesha(model="test-model", storage_path=storage_path)

            result = shesha.create_project_from_repo(
                url=str(sample_git_repo),
                name="sample-project",
            )

            # Check that a document has line numbers
            docs = shesha._storage.load_all_documents("sample-project")
            main_doc = next(d for d in docs if "main.py" in d.name)

            assert "=== FILE:" in main_doc.content
            assert "1|" in main_doc.content

    def test_unchanged_on_second_call(self, sample_git_repo: Path, tmp_path: Path):
        """Second call returns unchanged when no changes."""
        storage_path = tmp_path / "shesha-storage"

        with patch("shesha.shesha.ContainerPool"):
            shesha = Shesha(model="test-model", storage_path=storage_path)

            # First call
            shesha.create_project_from_repo(
                url=str(sample_git_repo),
                name="sample-project",
            )

            # Second call
            result = shesha.create_project_from_repo(
                url=str(sample_git_repo),
                name="sample-project",
            )

            assert result.status == "unchanged"

    def test_updates_available_after_change(self, sample_git_repo: Path, tmp_path: Path):
        """Returns updates_available after repo changes."""
        storage_path = tmp_path / "shesha-storage"

        with patch("shesha.shesha.ContainerPool"):
            shesha = Shesha(model="test-model", storage_path=storage_path)

            # First call
            shesha.create_project_from_repo(
                url=str(sample_git_repo),
                name="sample-project",
            )

            # Modify repo
            (sample_git_repo / "src" / "new_file.py").write_text("# New file\n")
            subprocess.run(["git", "add", "."], cwd=sample_git_repo, capture_output=True)
            subprocess.run(
                ["git", "commit", "-m", "Add new file"],
                cwd=sample_git_repo,
                capture_output=True,
            )

            # Second call
            result = shesha.create_project_from_repo(
                url=str(sample_git_repo),
                name="sample-project",
            )

            assert result.status == "updates_available"
```

**Step 3: Run integration tests**

Run: `pytest tests/integration/ -v`
Expected: PASS

**Step 4: Commit**

```bash
git add tests/integration/ tests/fixtures/
git commit -m "test: add integration tests for repo ingestion"
```

---

## Task 17: Run Full Test Suite and Type Checking

**Files:**
- No new files

**Step 1: Run full test suite**

Run: `pytest tests/ -v`
Expected: All tests pass

**Step 2: Run type checking**

Run: `mypy src/shesha`
Expected: No errors (or only pre-existing errors)

**Step 3: Run linting**

Run: `ruff check src tests`
Expected: No errors

**Step 4: Run formatter**

Run: `ruff format src tests`
Expected: No changes (or format applied)

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "chore: fix linting and type errors"
```

---

## Task 18: Update Package Exports and Documentation

**Files:**
- Modify: `src/shesha/__init__.py` (verify exports)
- Modify: `README.md` (add usage example)

**Step 1: Verify exports work**

Run: `python -c "from shesha import Shesha, RepoProjectResult; print('Exports OK')"`
Expected: Exports OK

**Step 2: Add usage example to README.md**

Add section to README.md (after existing usage section):

```markdown
### Analyzing Codebases

```python
from shesha import Shesha

with Shesha() as s:
    # Ingest a GitHub repository
    result = s.create_project_from_repo(
        url="https://github.com/org/repo",
        token="ghp_xxxxx",  # Optional, for private repos
    )

    print(f"Status: {result.status}")
    print(f"Files ingested: {result.files_ingested}")

    # Query the codebase
    answer = result.project.query("How does authentication work?")
    print(answer.answer)  # Includes file:line citations

    # Update when changes are available
    if result.status == "updates_available":
        result = result.apply_updates()
```

**Step 3: Commit documentation**

```bash
git add README.md src/shesha/__init__.py
git commit -m "docs: add create_project_from_repo usage example"
```

---

## Summary

This plan implements the codebase analyzer feature in 18 tasks:

1. **Tasks 1-4:** Core types (RepoProjectResult, exceptions, exports)
2. **Tasks 5-7:** CodeParser enhancements (line numbers, encoding, shebang)
3. **Tasks 8-14:** RepoIngester class (clone, SHA tracking, file listing)
4. **Task 15:** Main API method on Shesha class
5. **Tasks 16-18:** Integration tests, verification, documentation

Each task follows TDD (Red → Green → Refactor → Commit) per CLAUDE.md requirements.
