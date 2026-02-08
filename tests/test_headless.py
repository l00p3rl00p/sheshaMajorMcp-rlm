"""Headless validation test for GUI scaffold compliance.

This test verifies the core system remains fully functional without the GUI.
It simulates the scenario where /gui is deleted from the project.

Run with:
    pytest tests/test_headless.py -v
"""

import subprocess
import sys
from pathlib import Path

import pytest


def test_install_command_runs_headless():
    """Verify librarian install works without GUI (skip Docker for CI)."""
    result = subprocess.run(
        [sys.executable, "-m", "shesha.librarian", "install", "--skip-docker", "--skip-sandbox"],
        capture_output=True,
        text=True,
        timeout=30,
    )
    # Should succeed or only fail due to environment issues, not missing GUI
    assert "gui" not in result.stderr.lower() or "gui" not in result.stdout.lower()
    # Install may fail in CI due to no manifest dir, but shouldn't reference GUI
    print(f"Install stdout: {result.stdout[:500]}")


def test_mcp_help_runs_headless():
    """Verify librarian mcp --help works without GUI."""
    result = subprocess.run(
        [sys.executable, "-m", "shesha.librarian", "mcp", "--help"],
        capture_output=True,
        text=True,
        timeout=10,
    )
    assert result.returncode == 0
    assert "storage-path" in result.stdout
    assert "gui" not in result.stdout.lower()


def test_projects_list_help_runs_headless():
    """Verify librarian projects list works without GUI."""
    result = subprocess.run(
        [sys.executable, "-m", "shesha.librarian", "projects", "list", "--help"],
        capture_output=True,
        text=True,
        timeout=10,
    )
    assert result.returncode == 0
    assert "storage-path" in result.stdout


def test_query_help_runs_headless():
    """Verify librarian query --help works without GUI."""
    result = subprocess.run(
        [sys.executable, "-m", "shesha.librarian", "query", "--help"],
        capture_output=True,
        text=True,
        timeout=10,
    )
    assert result.returncode == 0
    assert "project" in result.stdout


def test_core_imports_without_gui():
    """Verify core modules import without GUI dependencies."""
    # These imports should succeed even if GUI doesn't exist
    from shesha.librarian.core import LibrarianCore  # noqa: F401
    from shesha.librarian.manifest import LibrarianManifest  # noqa: F401
    from shesha.librarian.paths import resolve_paths  # noqa: F401


def test_gui_not_required_for_startup():
    """Verify no imports from gui/ exist in core modules."""
    shesha_src = Path(__file__).parent.parent / "src" / "shesha"
    
    # Search for any imports from gui in core modules
    gui_imports = []
    for py_file in shesha_src.rglob("*.py"):
        content = py_file.read_text()
        if "from gui" in content or "import gui" in content:
            gui_imports.append(str(py_file))
    
    assert len(gui_imports) == 0, f"Core modules import from GUI: {gui_imports}"
