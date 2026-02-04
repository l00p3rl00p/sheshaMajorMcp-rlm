# Query Trace Logging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement automatic JSONL trace logging for every RLM query to enable post-hoc debugging.

**Architecture:** New `TraceWriter` class handles serialization and file management. Storage layer provides trace directory access. Engine calls writer after each query completes. Cleanup runs after each write.

**Tech Stack:** Python dataclasses, JSON serialization, pathlib for file operations.

---

## Task 1: Add Config Setting

**Files:**
- Modify: `src/shesha/config.py:12-52`
- Test: `tests/unit/test_config.py` (create if needed)

**Step 1: Write the failing test**

Create `tests/unit/test_config.py`:

```python
"""Tests for configuration."""

import os

import pytest

from shesha.config import SheshaConfig


class TestMaxTracesConfig:
    """Tests for max_traces_per_project config."""

    def test_default_max_traces_is_50(self) -> None:
        """Default max_traces_per_project is 50."""
        config = SheshaConfig()
        assert config.max_traces_per_project == 50

    def test_max_traces_from_env(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """SHESHA_MAX_TRACES_PER_PROJECT env var sets max_traces_per_project."""
        monkeypatch.setenv("SHESHA_MAX_TRACES_PER_PROJECT", "100")
        config = SheshaConfig.load()
        assert config.max_traces_per_project == 100
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_config.py -v`
Expected: FAIL with `AttributeError: 'SheshaConfig' object has no attribute 'max_traces_per_project'`

**Step 3: Write minimal implementation**

In `src/shesha/config.py`, add to `SheshaConfig` dataclass (after line 32):

```python
    # Trace logging
    max_traces_per_project: int = 50
```

In `env_map` dict (around line 93), add:

```python
            "SHESHA_MAX_TRACES_PER_PROJECT": "max_traces_per_project",
```

In the int conversion block (around line 97), add `"max_traces_per_project"`:

```python
                if field_name in {"pool_size", "max_iterations", "max_traces_per_project"}:
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_config.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/config.py tests/unit/test_config.py
git commit -m "feat(config): add max_traces_per_project setting"
```

---

## Task 2: Add QueryContext Dataclass

**Files:**
- Modify: `src/shesha/models.py`
- Test: `tests/unit/test_models.py` (create if needed)

**Step 1: Write the failing test**

Create `tests/unit/test_models.py`:

```python
"""Tests for core data models."""

from shesha.models import QueryContext


class TestQueryContext:
    """Tests for QueryContext dataclass."""

    def test_query_context_stores_metadata(self) -> None:
        """QueryContext stores all query metadata."""
        ctx = QueryContext(
            trace_id="abc123",
            question="What is X?",
            document_ids=["doc1", "doc2"],
            model="claude-sonnet-4-20250514",
            system_prompt="You are an assistant...",
            subcall_prompt="Analyze this...",
        )
        assert ctx.trace_id == "abc123"
        assert ctx.question == "What is X?"
        assert ctx.document_ids == ["doc1", "doc2"]
        assert ctx.model == "claude-sonnet-4-20250514"
        assert ctx.system_prompt == "You are an assistant..."
        assert ctx.subcall_prompt == "Analyze this..."
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_models.py::TestQueryContext -v`
Expected: FAIL with `ImportError: cannot import name 'QueryContext'`

**Step 3: Write minimal implementation**

In `src/shesha/models.py`, add at end of file:

```python
@dataclass
class QueryContext:
    """Metadata about a query for trace logging."""

    trace_id: str
    question: str
    document_ids: list[str]
    model: str
    system_prompt: str
    subcall_prompt: str
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_models.py::TestQueryContext -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/models.py tests/unit/test_models.py
git commit -m "feat(models): add QueryContext dataclass"
```

---

## Task 3: Add Storage Trace Directory Methods

**Files:**
- Modify: `src/shesha/storage/filesystem.py`
- Modify: `tests/unit/storage/test_filesystem.py`

**Step 1: Write the failing tests**

Add to `tests/unit/storage/test_filesystem.py`:

```python
class TestTraceOperations:
    """Tests for trace file operations."""

    def test_get_traces_dir_creates_directory(self, storage: FilesystemStorage) -> None:
        """get_traces_dir creates traces directory if needed."""
        storage.create_project("trace-project")
        traces_dir = storage.get_traces_dir("trace-project")
        assert traces_dir.exists()
        assert traces_dir.name == "traces"

    def test_get_traces_dir_nonexistent_project_raises(
        self, storage: FilesystemStorage
    ) -> None:
        """get_traces_dir raises for nonexistent project."""
        with pytest.raises(ProjectNotFoundError):
            storage.get_traces_dir("no-such-project")

    def test_list_traces_empty(self, storage: FilesystemStorage) -> None:
        """list_traces returns empty list when no traces exist."""
        storage.create_project("empty-traces")
        assert storage.list_traces("empty-traces") == []

    def test_list_traces_returns_sorted_by_name(
        self, storage: FilesystemStorage
    ) -> None:
        """list_traces returns files sorted by name (oldest first)."""
        storage.create_project("sorted-traces")
        traces_dir = storage.get_traces_dir("sorted-traces")
        # Create files with timestamps in names (older first)
        (traces_dir / "2026-02-03T10-00-00-000_aaaa1111.jsonl").write_text("{}")
        (traces_dir / "2026-02-03T10-00-01-000_bbbb2222.jsonl").write_text("{}")
        (traces_dir / "2026-02-03T10-00-02-000_cccc3333.jsonl").write_text("{}")
        traces = storage.list_traces("sorted-traces")
        assert len(traces) == 3
        assert traces[0].name == "2026-02-03T10-00-00-000_aaaa1111.jsonl"
        assert traces[2].name == "2026-02-03T10-00-02-000_cccc3333.jsonl"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/storage/test_filesystem.py::TestTraceOperations -v`
Expected: FAIL with `AttributeError: 'FilesystemStorage' object has no attribute 'get_traces_dir'`

**Step 3: Write minimal implementation**

In `src/shesha/storage/filesystem.py`, add at end of class:

```python
    def get_traces_dir(self, project_id: str) -> Path:
        """Get the traces directory for a project, creating it if needed."""
        if not self.project_exists(project_id):
            raise ProjectNotFoundError(project_id)
        traces_dir = self._project_path(project_id) / "traces"
        traces_dir.mkdir(exist_ok=True)
        return traces_dir

    def list_traces(self, project_id: str) -> list[Path]:
        """List all trace files in a project, sorted by name (oldest first)."""
        traces_dir = self.get_traces_dir(project_id)
        traces = list(traces_dir.glob("*.jsonl"))
        return sorted(traces, key=lambda p: p.name)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/storage/test_filesystem.py::TestTraceOperations -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/storage/filesystem.py tests/unit/storage/test_filesystem.py
git commit -m "feat(storage): add trace directory methods"
```

---

## Task 4: Create TraceWriter - File Creation

**Files:**
- Create: `src/shesha/rlm/trace_writer.py`
- Create: `tests/unit/rlm/test_trace_writer.py`

**Step 1: Write the failing test**

Create `tests/unit/rlm/test_trace_writer.py`:

```python
"""Tests for trace writer."""

from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

import pytest

from shesha.models import QueryContext
from shesha.rlm.trace import StepType, TokenUsage, Trace
from shesha.storage.filesystem import FilesystemStorage


class TestTraceWriterFileCreation:
    """Tests for trace file creation."""

    @pytest.fixture
    def storage(self, tmp_path: Path) -> FilesystemStorage:
        """Create a temporary storage backend."""
        storage = FilesystemStorage(root_path=tmp_path)
        storage.create_project("test-project")
        return storage

    @pytest.fixture
    def trace(self) -> Trace:
        """Create a sample trace."""
        trace = Trace()
        trace.add_step(StepType.CODE_GENERATED, "print('hello')", iteration=0)
        trace.add_step(StepType.CODE_OUTPUT, "hello", iteration=0)
        return trace

    @pytest.fixture
    def context(self) -> QueryContext:
        """Create a sample query context."""
        return QueryContext(
            trace_id="abcd1234-5678-90ab-cdef-1234567890ab",
            question="What is the answer?",
            document_ids=["doc1", "doc2"],
            model="claude-sonnet-4-20250514",
            system_prompt="You are an assistant...",
            subcall_prompt="Analyze this...",
        )

    def test_write_trace_creates_jsonl_file(
        self,
        storage: FilesystemStorage,
        trace: Trace,
        context: QueryContext,
    ) -> None:
        """write_trace creates a .jsonl file in the traces directory."""
        from shesha.rlm.trace_writer import TraceWriter

        writer = TraceWriter(storage)
        # Mock datetime to get predictable filename
        fixed_time = datetime(2026, 2, 3, 14, 30, 0, 123000, tzinfo=timezone.utc)
        with patch("shesha.rlm.trace_writer.datetime") as mock_dt:
            mock_dt.now.return_value = fixed_time
            mock_dt.timezone = timezone
            path = writer.write_trace(
                project_id="test-project",
                trace=trace,
                context=context,
                answer="42",
                token_usage=TokenUsage(prompt_tokens=100, completion_tokens=50),
                execution_time=1.5,
                status="success",
            )

        assert path.exists()
        assert path.suffix == ".jsonl"
        assert path.parent.name == "traces"
        # Check filename format: YYYY-MM-DDTHH-MM-SS-mmm_shortid.jsonl
        assert "2026-02-03T14-30-00-123" in path.name
        assert "abcd1234" in path.name
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterFileCreation::test_write_trace_creates_jsonl_file -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'shesha.rlm.trace_writer'`

**Step 3: Write minimal implementation**

Create `src/shesha/rlm/trace_writer.py`:

```python
"""Trace writer for saving query traces to JSONL files."""

from datetime import datetime, timezone
from pathlib import Path

from shesha.models import QueryContext
from shesha.rlm.trace import TokenUsage, Trace
from shesha.storage.filesystem import FilesystemStorage


class TraceWriter:
    """Writes query traces to JSONL files."""

    def __init__(self, storage: FilesystemStorage) -> None:
        """Initialize with storage backend."""
        self.storage = storage

    def write_trace(
        self,
        project_id: str,
        trace: Trace,
        context: QueryContext,
        answer: str,
        token_usage: TokenUsage,
        execution_time: float,
        status: str,
    ) -> Path:
        """Write a trace to a JSONL file.

        Args:
            project_id: The project ID
            trace: The execution trace
            context: Query metadata
            answer: The final answer
            token_usage: Token usage statistics
            execution_time: Total execution time in seconds
            status: Query status (success, max_iterations, error)

        Returns:
            Path to the created trace file
        """
        traces_dir = self.storage.get_traces_dir(project_id)

        # Generate filename: YYYY-MM-DDTHH-MM-SS-mmm_shortid.jsonl
        now = datetime.now(timezone.utc)
        timestamp = now.strftime("%Y-%m-%dT%H-%M-%S") + f"-{now.microsecond // 1000:03d}"
        short_id = context.trace_id[:8]
        filename = f"{timestamp}_{short_id}.jsonl"

        path = traces_dir / filename
        path.write_text("")  # Create empty file for now

        return path
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterFileCreation::test_write_trace_creates_jsonl_file -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/rlm/trace_writer.py tests/unit/rlm/test_trace_writer.py
git commit -m "feat(trace_writer): create trace file with correct path"
```

---

## Task 5: TraceWriter - Header Content

**Files:**
- Modify: `src/shesha/rlm/trace_writer.py`
- Modify: `tests/unit/rlm/test_trace_writer.py`

**Step 1: Write the failing test**

Add to `tests/unit/rlm/test_trace_writer.py`:

```python
import json


class TestTraceWriterContent:
    """Tests for trace file content."""

    @pytest.fixture
    def storage(self, tmp_path: Path) -> FilesystemStorage:
        """Create a temporary storage backend."""
        storage = FilesystemStorage(root_path=tmp_path)
        storage.create_project("test-project")
        return storage

    @pytest.fixture
    def trace(self) -> Trace:
        """Create a sample trace."""
        trace = Trace()
        trace.add_step(StepType.CODE_GENERATED, "print('hello')", iteration=0)
        trace.add_step(StepType.CODE_OUTPUT, "hello", iteration=0)
        return trace

    @pytest.fixture
    def context(self) -> QueryContext:
        """Create a sample query context."""
        return QueryContext(
            trace_id="abcd1234-5678-90ab-cdef-1234567890ab",
            question="What is the answer?",
            document_ids=["doc1", "doc2"],
            model="claude-sonnet-4-20250514",
            system_prompt="You are an assistant...",
            subcall_prompt="Analyze this...",
        )

    def test_trace_file_contains_header_with_metadata(
        self,
        storage: FilesystemStorage,
        trace: Trace,
        context: QueryContext,
    ) -> None:
        """First line of trace file is header with query metadata."""
        from shesha.rlm.trace_writer import TraceWriter

        writer = TraceWriter(storage)
        path = writer.write_trace(
            project_id="test-project",
            trace=trace,
            context=context,
            answer="42",
            token_usage=TokenUsage(prompt_tokens=100, completion_tokens=50),
            execution_time=1.5,
            status="success",
        )

        lines = path.read_text().strip().split("\n")
        header = json.loads(lines[0])

        assert header["type"] == "header"
        assert header["trace_id"] == "abcd1234-5678-90ab-cdef-1234567890ab"
        assert header["question"] == "What is the answer?"
        assert header["document_ids"] == ["doc1", "doc2"]
        assert header["model"] == "claude-sonnet-4-20250514"
        assert header["system_prompt"] == "You are an assistant..."
        assert header["subcall_prompt"] == "Analyze this..."
        assert "timestamp" in header
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterContent::test_trace_file_contains_header_with_metadata -v`
Expected: FAIL with `json.decoder.JSONDecodeError` (empty file)

**Step 3: Write minimal implementation**

Update `write_trace` in `src/shesha/rlm/trace_writer.py`:

```python
import json
from datetime import datetime, timezone
from pathlib import Path

from shesha.models import QueryContext
from shesha.rlm.trace import TokenUsage, Trace
from shesha.storage.filesystem import FilesystemStorage


class TraceWriter:
    """Writes query traces to JSONL files."""

    def __init__(self, storage: FilesystemStorage) -> None:
        """Initialize with storage backend."""
        self.storage = storage

    def write_trace(
        self,
        project_id: str,
        trace: Trace,
        context: QueryContext,
        answer: str,
        token_usage: TokenUsage,
        execution_time: float,
        status: str,
    ) -> Path:
        """Write a trace to a JSONL file."""
        traces_dir = self.storage.get_traces_dir(project_id)

        # Generate filename
        now = datetime.now(timezone.utc)
        timestamp = now.strftime("%Y-%m-%dT%H-%M-%S") + f"-{now.microsecond // 1000:03d}"
        short_id = context.trace_id[:8]
        filename = f"{timestamp}_{short_id}.jsonl"

        # Build lines
        lines: list[str] = []

        # Header
        header = {
            "type": "header",
            "trace_id": context.trace_id,
            "timestamp": now.isoformat(),
            "question": context.question,
            "document_ids": context.document_ids,
            "model": context.model,
            "system_prompt": context.system_prompt,
            "subcall_prompt": context.subcall_prompt,
        }
        lines.append(json.dumps(header))

        # Write file
        path = traces_dir / filename
        path.write_text("\n".join(lines) + "\n")

        return path
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterContent::test_trace_file_contains_header_with_metadata -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/rlm/trace_writer.py tests/unit/rlm/test_trace_writer.py
git commit -m "feat(trace_writer): write header with metadata"
```

---

## Task 6: TraceWriter - Steps Content

**Files:**
- Modify: `src/shesha/rlm/trace_writer.py`
- Modify: `tests/unit/rlm/test_trace_writer.py`

**Step 1: Write the failing test**

Add to `TestTraceWriterContent` in `tests/unit/rlm/test_trace_writer.py`:

```python
    def test_trace_file_contains_all_steps(
        self,
        storage: FilesystemStorage,
        context: QueryContext,
    ) -> None:
        """Trace file contains one line per step with correct fields."""
        from shesha.rlm.trace_writer import TraceWriter

        trace = Trace()
        trace.add_step(
            StepType.CODE_GENERATED, "print('hello')", iteration=0, tokens_used=50
        )
        trace.add_step(
            StepType.CODE_OUTPUT, "hello", iteration=0, duration_ms=100
        )
        trace.add_step(
            StepType.FINAL_ANSWER, "42", iteration=0
        )

        writer = TraceWriter(storage)
        path = writer.write_trace(
            project_id="test-project",
            trace=trace,
            context=context,
            answer="42",
            token_usage=TokenUsage(prompt_tokens=100, completion_tokens=50),
            execution_time=1.5,
            status="success",
        )

        lines = path.read_text().strip().split("\n")
        # Header + 3 steps + summary = 5 lines
        assert len(lines) >= 4  # At least header + 3 steps

        # Check step lines (lines 1, 2, 3)
        step1 = json.loads(lines[1])
        assert step1["type"] == "step"
        assert step1["step_type"] == "code_generated"
        assert step1["iteration"] == 0
        assert step1["content"] == "print('hello')"
        assert step1["tokens_used"] == 50

        step2 = json.loads(lines[2])
        assert step2["type"] == "step"
        assert step2["step_type"] == "code_output"
        assert step2["duration_ms"] == 100

        step3 = json.loads(lines[3])
        assert step3["type"] == "step"
        assert step3["step_type"] == "final_answer"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterContent::test_trace_file_contains_all_steps -v`
Expected: FAIL with `IndexError` or assertion error (not enough lines)

**Step 3: Write minimal implementation**

Update `write_trace` in `src/shesha/rlm/trace_writer.py` to add step serialization after header:

```python
        # Steps
        for step in trace.steps:
            step_data = {
                "type": "step",
                "step_type": step.type.value,
                "iteration": step.iteration,
                "timestamp": datetime.fromtimestamp(step.timestamp, tz=timezone.utc).isoformat(),
                "content": step.content,
                "tokens_used": step.tokens_used,
                "duration_ms": step.duration_ms,
            }
            lines.append(json.dumps(step_data))
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterContent::test_trace_file_contains_all_steps -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/rlm/trace_writer.py tests/unit/rlm/test_trace_writer.py
git commit -m "feat(trace_writer): write step lines"
```

---

## Task 7: TraceWriter - Summary Line

**Files:**
- Modify: `src/shesha/rlm/trace_writer.py`
- Modify: `tests/unit/rlm/test_trace_writer.py`

**Step 1: Write the failing test**

Add to `TestTraceWriterContent` in `tests/unit/rlm/test_trace_writer.py`:

```python
    def test_trace_file_ends_with_summary(
        self,
        storage: FilesystemStorage,
        trace: Trace,
        context: QueryContext,
    ) -> None:
        """Last line of trace file is summary with totals."""
        from shesha.rlm.trace_writer import TraceWriter

        writer = TraceWriter(storage)
        path = writer.write_trace(
            project_id="test-project",
            trace=trace,
            context=context,
            answer="42",
            token_usage=TokenUsage(prompt_tokens=100, completion_tokens=50),
            execution_time=1.5,
            status="success",
        )

        lines = path.read_text().strip().split("\n")
        summary = json.loads(lines[-1])

        assert summary["type"] == "summary"
        assert summary["answer"] == "42"
        assert summary["total_iterations"] == 1  # iteration 0 = 1 iteration
        assert summary["total_tokens"] == {"prompt": 100, "completion": 50}
        assert summary["total_duration_ms"] == 1500
        assert summary["status"] == "success"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterContent::test_trace_file_ends_with_summary -v`
Expected: FAIL with assertion error (last line is a step, not summary)

**Step 3: Write minimal implementation**

Update `write_trace` in `src/shesha/rlm/trace_writer.py` to add summary after steps:

```python
        # Summary
        max_iteration = max((s.iteration for s in trace.steps), default=0)
        summary = {
            "type": "summary",
            "answer": answer,
            "total_iterations": max_iteration + 1,
            "total_tokens": {
                "prompt": token_usage.prompt_tokens,
                "completion": token_usage.completion_tokens,
            },
            "total_duration_ms": int(execution_time * 1000),
            "status": status,
        }
        lines.append(json.dumps(summary))
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterContent::test_trace_file_ends_with_summary -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/rlm/trace_writer.py tests/unit/rlm/test_trace_writer.py
git commit -m "feat(trace_writer): write summary line"
```

---

## Task 8: TraceWriter - Cleanup

**Files:**
- Modify: `src/shesha/rlm/trace_writer.py`
- Modify: `tests/unit/rlm/test_trace_writer.py`

**Step 1: Write the failing test**

Add new test class to `tests/unit/rlm/test_trace_writer.py`:

```python
class TestTraceWriterCleanup:
    """Tests for trace cleanup."""

    @pytest.fixture
    def storage(self, tmp_path: Path) -> FilesystemStorage:
        """Create a temporary storage backend."""
        storage = FilesystemStorage(root_path=tmp_path)
        storage.create_project("test-project")
        return storage

    def test_cleanup_removes_oldest_traces(
        self, storage: FilesystemStorage
    ) -> None:
        """cleanup_old_traces removes oldest when over limit."""
        from shesha.rlm.trace_writer import TraceWriter

        traces_dir = storage.get_traces_dir("test-project")
        # Create 5 trace files
        for i in range(5):
            (traces_dir / f"2026-02-03T10-00-0{i}-000_aaaa{i}111.jsonl").write_text("{}")

        writer = TraceWriter(storage)
        writer.cleanup_old_traces("test-project", max_count=3)

        remaining = storage.list_traces("test-project")
        assert len(remaining) == 3
        # Oldest 2 should be deleted, newest 3 remain
        names = [p.name for p in remaining]
        assert "2026-02-03T10-00-02-000_aaaa2111.jsonl" in names
        assert "2026-02-03T10-00-03-000_aaaa3111.jsonl" in names
        assert "2026-02-03T10-00-04-000_aaaa4111.jsonl" in names

    def test_cleanup_does_nothing_under_limit(
        self, storage: FilesystemStorage
    ) -> None:
        """cleanup_old_traces does nothing when under limit."""
        from shesha.rlm.trace_writer import TraceWriter

        traces_dir = storage.get_traces_dir("test-project")
        # Create 2 trace files
        (traces_dir / "2026-02-03T10-00-00-000_aaaa1111.jsonl").write_text("{}")
        (traces_dir / "2026-02-03T10-00-01-000_bbbb2222.jsonl").write_text("{}")

        writer = TraceWriter(storage)
        writer.cleanup_old_traces("test-project", max_count=5)

        remaining = storage.list_traces("test-project")
        assert len(remaining) == 2
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterCleanup -v`
Expected: FAIL with `AttributeError: 'TraceWriter' object has no attribute 'cleanup_old_traces'`

**Step 3: Write minimal implementation**

Add to `TraceWriter` class in `src/shesha/rlm/trace_writer.py`:

```python
    def cleanup_old_traces(self, project_id: str, max_count: int = 50) -> None:
        """Remove oldest traces if count exceeds max_count.

        Args:
            project_id: The project ID
            max_count: Maximum number of traces to keep
        """
        traces = self.storage.list_traces(project_id)
        if len(traces) <= max_count:
            return

        # Sorted oldest first, delete until under limit
        to_delete = traces[: len(traces) - max_count]
        for trace_path in to_delete:
            trace_path.unlink()
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterCleanup -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/rlm/trace_writer.py tests/unit/rlm/test_trace_writer.py
git commit -m "feat(trace_writer): add cleanup_old_traces"
```

---

## Task 9: TraceWriter - Redaction and Error Handling

**Files:**
- Modify: `src/shesha/rlm/trace_writer.py`
- Modify: `tests/unit/rlm/test_trace_writer.py`

**Step 1: Write the failing tests**

Add to `tests/unit/rlm/test_trace_writer.py`:

```python
class TestTraceWriterSafety:
    """Tests for error handling and redaction."""

    @pytest.fixture
    def storage(self, tmp_path: Path) -> FilesystemStorage:
        """Create a temporary storage backend."""
        storage = FilesystemStorage(root_path=tmp_path)
        storage.create_project("test-project")
        return storage

    @pytest.fixture
    def context(self) -> QueryContext:
        """Create a sample query context."""
        return QueryContext(
            trace_id="abcd1234-5678-90ab-cdef-1234567890ab",
            question="What is the answer?",
            document_ids=["doc1"],
            model="claude-sonnet-4-20250514",
            system_prompt="System prompt",
            subcall_prompt="Subcall prompt",
        )

    def test_traces_are_redacted_before_writing(
        self, storage: FilesystemStorage, context: QueryContext
    ) -> None:
        """Secrets in trace content are redacted before writing."""
        from shesha.rlm.trace_writer import TraceWriter

        trace = Trace()
        trace.add_step(
            StepType.CODE_OUTPUT,
            "API key: sk-abc123def456ghi789jkl012mno345pqr678",
            iteration=0,
        )

        writer = TraceWriter(storage)
        path = writer.write_trace(
            project_id="test-project",
            trace=trace,
            context=context,
            answer="done",
            token_usage=TokenUsage(),
            execution_time=1.0,
            status="success",
        )

        content = path.read_text()
        assert "sk-abc123" not in content
        assert "[REDACTED]" in content

    def test_write_failure_does_not_raise(
        self, storage: FilesystemStorage, context: QueryContext
    ) -> None:
        """Write failures return None instead of raising."""
        from shesha.rlm.trace_writer import TraceWriter

        trace = Trace()
        trace.add_step(StepType.CODE_GENERATED, "code", iteration=0)

        writer = TraceWriter(storage)

        # Make traces dir read-only to force write failure
        traces_dir = storage.get_traces_dir("test-project")
        traces_dir.chmod(0o444)

        try:
            result = writer.write_trace(
                project_id="test-project",
                trace=trace,
                context=context,
                answer="done",
                token_usage=TokenUsage(),
                execution_time=1.0,
                status="success",
            )
            # Should return None on failure, not raise
            assert result is None
        finally:
            # Restore permissions for cleanup
            traces_dir.chmod(0o755)
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterSafety -v`
Expected: FAIL with assertion errors

**Step 3: Write minimal implementation**

Update `write_trace` in `src/shesha/rlm/trace_writer.py`:

```python
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from shesha.models import QueryContext
from shesha.rlm.trace import TokenUsage, Trace
from shesha.storage.filesystem import FilesystemStorage

logger = logging.getLogger(__name__)


class TraceWriter:
    """Writes query traces to JSONL files."""

    def __init__(self, storage: FilesystemStorage) -> None:
        """Initialize with storage backend."""
        self.storage = storage

    def write_trace(
        self,
        project_id: str,
        trace: Trace,
        context: QueryContext,
        answer: str,
        token_usage: TokenUsage,
        execution_time: float,
        status: str,
    ) -> Path | None:
        """Write a trace to a JSONL file.

        Returns:
            Path to the created trace file, or None if write failed
        """
        try:
            # Apply redaction
            redacted_trace = trace.redacted()

            traces_dir = self.storage.get_traces_dir(project_id)

            # Generate filename
            now = datetime.now(timezone.utc)
            timestamp = now.strftime("%Y-%m-%dT%H-%M-%S") + f"-{now.microsecond // 1000:03d}"
            short_id = context.trace_id[:8]
            filename = f"{timestamp}_{short_id}.jsonl"

            # Build lines
            lines: list[str] = []

            # Header
            header = {
                "type": "header",
                "trace_id": context.trace_id,
                "timestamp": now.isoformat(),
                "question": context.question,
                "document_ids": context.document_ids,
                "model": context.model,
                "system_prompt": context.system_prompt,
                "subcall_prompt": context.subcall_prompt,
            }
            lines.append(json.dumps(header))

            # Steps (use redacted trace)
            for step in redacted_trace.steps:
                step_data = {
                    "type": "step",
                    "step_type": step.type.value,
                    "iteration": step.iteration,
                    "timestamp": datetime.fromtimestamp(
                        step.timestamp, tz=timezone.utc
                    ).isoformat(),
                    "content": step.content,
                    "tokens_used": step.tokens_used,
                    "duration_ms": step.duration_ms,
                }
                lines.append(json.dumps(step_data))

            # Summary
            max_iteration = max((s.iteration for s in redacted_trace.steps), default=0)
            summary = {
                "type": "summary",
                "answer": answer,
                "total_iterations": max_iteration + 1,
                "total_tokens": {
                    "prompt": token_usage.prompt_tokens,
                    "completion": token_usage.completion_tokens,
                },
                "total_duration_ms": int(execution_time * 1000),
                "status": status,
            }
            lines.append(json.dumps(summary))

            # Write file
            path = traces_dir / filename
            path.write_text("\n".join(lines) + "\n")

            return path

        except Exception as e:
            logger.warning(f"Failed to write trace for project {project_id}: {e}")
            return None

    def cleanup_old_traces(self, project_id: str, max_count: int = 50) -> None:
        """Remove oldest traces if count exceeds max_count."""
        traces = self.storage.list_traces(project_id)
        if len(traces) <= max_count:
            return

        to_delete = traces[: len(traces) - max_count]
        for trace_path in to_delete:
            trace_path.unlink()
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/rlm/test_trace_writer.py::TestTraceWriterSafety -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/rlm/trace_writer.py tests/unit/rlm/test_trace_writer.py
git commit -m "feat(trace_writer): add redaction and error handling"
```

---

## Task 10: Integrate with Engine

**Files:**
- Modify: `src/shesha/rlm/engine.py`
- Modify: `tests/unit/rlm/test_engine.py`

**Step 1: Write the failing test**

Add to `tests/unit/rlm/test_engine.py` (check existing structure first):

```python
class TestEngineTraceWriting:
    """Tests for trace writing integration."""

    def test_query_writes_trace_when_storage_provided(
        self, mock_llm: MagicMock, mock_executor: MagicMock, tmp_path: Path
    ) -> None:
        """Query writes trace file when storage is provided."""
        from shesha.storage.filesystem import FilesystemStorage

        storage = FilesystemStorage(root_path=tmp_path)
        storage.create_project("test-project")

        # Configure mock to return FINAL answer
        mock_llm.complete.return_value = MagicMock(
            content="```repl\nFINAL('answer')\n```",
            prompt_tokens=100,
            completion_tokens=50,
            total_tokens=150,
        )
        mock_executor.execute.return_value = MagicMock(
            stdout="",
            stderr="",
            error=None,
            final_answer="answer",
        )

        engine = RLMEngine(model="test-model")
        engine.query(
            documents=["doc content"],
            question="What?",
            storage=storage,
            project_id="test-project",
        )

        traces = storage.list_traces("test-project")
        assert len(traces) == 1
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/rlm/test_engine.py::TestEngineTraceWriting -v`
Expected: FAIL with `TypeError: query() got unexpected keyword argument 'storage'`

**Step 3: Write minimal implementation**

Update `RLMEngine.query()` signature in `src/shesha/rlm/engine.py`:

```python
import uuid

from shesha.models import QueryContext
from shesha.rlm.prompts import (
    SUBCALL_PROMPT_TEMPLATE,
    build_subcall_prompt,
    build_system_prompt,
    wrap_repl_output,
)
from shesha.rlm.trace_writer import TraceWriter
from shesha.storage.filesystem import FilesystemStorage

# In query() method signature, add optional parameters:
    def query(
        self,
        documents: list[str],
        question: str,
        doc_names: list[str] | None = None,
        on_progress: ProgressCallback | None = None,
        storage: FilesystemStorage | None = None,
        project_id: str | None = None,
    ) -> QueryResult:
```

At the end of `query()`, before the final return statements, add trace writing:

```python
        # Helper to write trace
        def _write_trace(result: QueryResult, status: str) -> None:
            if storage is not None and project_id is not None:
                trace_id = str(uuid.uuid4())
                context = QueryContext(
                    trace_id=trace_id,
                    question=question,
                    document_ids=doc_names or [f"doc_{i}" for i in range(len(documents))],
                    model=self.model,
                    system_prompt=system_prompt,
                    subcall_prompt=SUBCALL_PROMPT_TEMPLATE,
                )
                writer = TraceWriter(storage)
                writer.write_trace(
                    project_id=project_id,
                    trace=result.trace,
                    context=context,
                    answer=result.answer,
                    token_usage=result.token_usage,
                    execution_time=result.execution_time,
                    status=status,
                )
                writer.cleanup_old_traces(project_id)
```

Then modify the return statements to call this helper:

```python
                if final_answer:
                    result = QueryResult(
                        answer=final_answer,
                        trace=trace,
                        token_usage=token_usage,
                        execution_time=time.time() - start_time,
                    )
                    _write_trace(result, "success")
                    return result

            # Max iterations reached
            result = QueryResult(
                answer="[Max iterations reached without final answer]",
                trace=trace,
                token_usage=token_usage,
                execution_time=time.time() - start_time,
            )
            _write_trace(result, "max_iterations")
            return result
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/rlm/test_engine.py::TestEngineTraceWriting -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/rlm/engine.py tests/unit/rlm/test_engine.py
git commit -m "feat(engine): integrate trace writing"
```

---

## Task 11: Export Public API

**Files:**
- Modify: `src/shesha/rlm/__init__.py`
- Modify: `src/shesha/__init__.py`

**Step 1: Write the failing test**

Add to `tests/unit/test_public_api.py` (create if needed):

```python
"""Tests for public API exports."""


def test_query_context_exported_from_shesha() -> None:
    """QueryContext is importable from shesha."""
    from shesha import QueryContext

    assert QueryContext is not None


def test_trace_writer_exported_from_rlm() -> None:
    """TraceWriter is importable from shesha.rlm."""
    from shesha.rlm import TraceWriter

    assert TraceWriter is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_public_api.py -v`
Expected: FAIL with `ImportError`

**Step 3: Write minimal implementation**

Update `src/shesha/rlm/__init__.py`:

```python
from shesha.rlm.engine import ProgressCallback, QueryResult, RLMEngine
from shesha.rlm.trace import StepType, TokenUsage, Trace, TraceStep
from shesha.rlm.trace_writer import TraceWriter

__all__ = [
    "RLMEngine",
    "QueryResult",
    "Trace",
    "TraceStep",
    "StepType",
    "TokenUsage",
    "ProgressCallback",
    "TraceWriter",
]
```

Update `src/shesha/__init__.py` to add `QueryContext`:

```python
from shesha.models import ParsedDocument, QueryContext, RepoProjectResult
```

And add to `__all__`:

```python
    "QueryContext",
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_public_api.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shesha/rlm/__init__.py src/shesha/__init__.py tests/unit/test_public_api.py
git commit -m "feat: export TraceWriter and QueryContext in public API"
```

---

## Task 12: Run Full Test Suite

**Files:** None (verification only)

**Step 1: Run all tests**

Run: `make all`
Expected: All tests pass, no lint or type errors

**Step 2: Verify trace files work end-to-end**

Run: `pytest tests/unit/rlm/test_trace_writer.py -v`
Expected: All 8+ tests pass

**Step 3: Commit any final fixes**

If any tests fail, fix and commit.

---

## Summary

**Files Created:**
- `src/shesha/rlm/trace_writer.py` (~80 lines)
- `tests/unit/rlm/test_trace_writer.py` (~150 lines)
- `tests/unit/test_config.py` (~20 lines)
- `tests/unit/test_models.py` (~20 lines)
- `tests/unit/test_public_api.py` (~15 lines)

**Files Modified:**
- `src/shesha/config.py` - Added `max_traces_per_project` setting
- `src/shesha/models.py` - Added `QueryContext` dataclass
- `src/shesha/storage/filesystem.py` - Added `get_traces_dir()` and `list_traces()`
- `src/shesha/rlm/engine.py` - Added trace writing integration
- `src/shesha/rlm/__init__.py` - Exported `TraceWriter`
- `src/shesha/__init__.py` - Exported `QueryContext`
- `tests/unit/storage/test_filesystem.py` - Added trace operation tests
- `tests/unit/rlm/test_engine.py` - Added trace writing test
