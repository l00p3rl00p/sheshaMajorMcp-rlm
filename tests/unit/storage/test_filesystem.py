"""Tests for filesystem storage backend."""

from pathlib import Path

import pytest

from shesha.storage.base import ParsedDocument
from shesha.storage.filesystem import FilesystemStorage


@pytest.fixture
def storage(tmp_path: Path) -> FilesystemStorage:
    """Create a temporary storage backend."""
    return FilesystemStorage(root_path=tmp_path)


class TestProjectOperations:
    """Tests for project CRUD operations."""

    def test_create_project(self, storage: FilesystemStorage):
        """Creating a project creates the directory structure."""
        storage.create_project("test-project")
        assert storage.project_exists("test-project")

    def test_list_projects_empty(self, storage: FilesystemStorage):
        """List projects returns empty list when none exist."""
        assert storage.list_projects() == []

    def test_list_projects(self, storage: FilesystemStorage):
        """List projects returns all project IDs."""
        storage.create_project("project-a")
        storage.create_project("project-b")
        projects = storage.list_projects()
        assert sorted(projects) == ["project-a", "project-b"]

    def test_delete_project(self, storage: FilesystemStorage):
        """Deleting a project removes it completely."""
        storage.create_project("to-delete")
        storage.delete_project("to-delete")
        assert not storage.project_exists("to-delete")

    def test_create_duplicate_project_raises(self, storage: FilesystemStorage):
        """Creating a project that exists raises an error."""
        storage.create_project("existing")
        with pytest.raises(ValueError, match="already exists"):
            storage.create_project("existing")
