"""Storage backend protocol and data classes."""

from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class ParsedDocument:
    """A parsed document ready for storage and querying."""

    name: str
    content: str
    format: str
    metadata: dict[str, str | int | float | bool]
    char_count: int
    parse_warnings: list[str] = field(default_factory=list)


class StorageBackend(Protocol):
    """Protocol for pluggable storage backends."""

    def create_project(self, project_id: str) -> None:
        """Create a new project."""
        ...

    def delete_project(self, project_id: str) -> None:
        """Delete a project and all its documents."""
        ...

    def list_projects(self) -> list[str]:
        """List all project IDs."""
        ...

    def project_exists(self, project_id: str) -> bool:
        """Check if a project exists."""
        ...

    def store_document(self, project_id: str, doc: ParsedDocument) -> None:
        """Store a parsed document in a project."""
        ...

    def get_document(self, project_id: str, doc_name: str) -> ParsedDocument:
        """Retrieve a document by name."""
        ...

    def list_documents(self, project_id: str) -> list[str]:
        """List all document names in a project."""
        ...

    def delete_document(self, project_id: str, doc_name: str) -> None:
        """Delete a document from a project."""
        ...

    def load_all_documents(self, project_id: str) -> list[ParsedDocument]:
        """Load all documents in a project for querying."""
        ...
