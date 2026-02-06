"""Tests for multi_repo example script."""

import sys
from pathlib import Path

# Add examples to path for import
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "examples"))


def test_multi_repo_script_importable():
    """multi_repo.py can be imported."""
    import multi_repo

    assert hasattr(multi_repo, "main")


def test_multi_repo_has_parse_args():
    """multi_repo.py has argument parser."""
    import multi_repo

    assert hasattr(multi_repo, "parse_args")
