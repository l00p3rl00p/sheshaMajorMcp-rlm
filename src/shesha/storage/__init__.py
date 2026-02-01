"""Storage backend for Shesha."""

from shesha.storage.base import ParsedDocument, StorageBackend
from shesha.storage.filesystem import FilesystemStorage

__all__ = ["ParsedDocument", "StorageBackend", "FilesystemStorage"]
