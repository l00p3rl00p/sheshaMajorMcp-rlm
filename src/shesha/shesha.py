"""Main Shesha class - the public API."""

import atexit
import weakref
from pathlib import Path
from typing import TYPE_CHECKING

from shesha.config import SheshaConfig
from shesha.parser import create_default_registry
from shesha.project import Project
from shesha.rlm.engine import RLMEngine
from shesha.sandbox.pool import ContainerPool
from shesha.storage.filesystem import FilesystemStorage

if TYPE_CHECKING:
    from shesha.parser.base import DocumentParser


class Shesha:
    """Main entry point for Shesha - Recursive Language Models."""

    def __init__(
        self,
        model: str | None = None,
        storage_path: str | Path | None = None,
        api_key: str | None = None,
        pool_size: int | None = None,
        config: SheshaConfig | None = None,
    ) -> None:
        """Initialize Shesha."""
        # Use provided config or create from args
        if config is None:
            config = SheshaConfig()
        if model is not None:
            config.model = model
        if storage_path is not None:
            config.storage_path = str(storage_path)
        if api_key is not None:
            config.api_key = api_key
        if pool_size is not None:
            config.pool_size = pool_size

        self._config = config

        # Initialize components
        self._storage = FilesystemStorage(
            config.storage_path,
            keep_raw_files=config.keep_raw_files,
        )
        self._parser_registry = create_default_registry()
        self._pool = ContainerPool(
            size=config.pool_size,
            image=config.sandbox_image,
            memory_limit=f"{config.container_memory_mb}m",
        )

        # Create RLM engine
        self._rlm_engine = RLMEngine(
            model=config.model,
            api_key=config.api_key,
            max_iterations=config.max_iterations,
            max_output_chars=config.max_output_chars,
            execution_timeout=config.execution_timeout_sec,
        )

        # Track if stopped to avoid double-cleanup
        self._stopped = False

        # Register cleanup on exit using weak reference
        weak_self = weakref.ref(self)

        def _cleanup() -> None:
            obj = weak_self()
            if obj is not None:
                obj.stop()

        atexit.register(_cleanup)

    def create_project(self, project_id: str) -> Project:
        """Create a new project."""
        self._storage.create_project(project_id)
        return Project(
            project_id=project_id,
            storage=self._storage,
            parser_registry=self._parser_registry,
            rlm_engine=self._rlm_engine,
        )

    def get_project(self, project_id: str) -> Project:
        """Get an existing project."""
        if not self._storage.project_exists(project_id):
            raise ValueError(f"Project '{project_id}' does not exist")
        return Project(
            project_id=project_id,
            storage=self._storage,
            parser_registry=self._parser_registry,
            rlm_engine=self._rlm_engine,
        )

    def list_projects(self) -> list[str]:
        """List all projects."""
        return self._storage.list_projects()

    def delete_project(self, project_id: str) -> None:
        """Delete a project."""
        self._storage.delete_project(project_id)

    def register_parser(self, parser: "DocumentParser") -> None:
        """Register a custom document parser."""
        self._parser_registry.register(parser)

    def start(self) -> None:
        """Start the container pool."""
        self._pool.start()

    def stop(self) -> None:
        """Stop the container pool."""
        if self._stopped:
            return
        self._stopped = True
        self._pool.stop()

    def __enter__(self) -> "Shesha":
        """Context manager entry."""
        self.start()
        return self

    def __exit__(self, *args: object) -> None:
        """Context manager exit."""
        self.stop()
