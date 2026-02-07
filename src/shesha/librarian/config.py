"""Local user configuration for Librarian.

This is intentionally small: a single JSON file under LIBRARIAN_HOME.
The GUI bridge reads this so browser UI can stay "visibility-first" while
still knowing where the operator chose to place local state (manifest-dir).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from shesha.librarian.paths import LibrarianPaths


@dataclass(frozen=True)
class LibrarianConfig:
    manifest_dir: Path | None = None


def _config_path(paths: LibrarianPaths) -> Path:
    return paths.home / "config.json"


def load_config(paths: LibrarianPaths) -> LibrarianConfig:
    path = _config_path(paths)
    if not path.exists():
        return LibrarianConfig()
    try:
        data = json.loads(path.read_text())
    except Exception:
        return LibrarianConfig()

    manifest_dir = data.get("manifest_dir")
    if isinstance(manifest_dir, str) and manifest_dir.strip():
        return LibrarianConfig(manifest_dir=Path(manifest_dir).expanduser())
    return LibrarianConfig()


def save_config(paths: LibrarianPaths, config: LibrarianConfig) -> None:
    payload: dict[str, Any] = {}
    if config.manifest_dir is not None:
        payload["manifest_dir"] = str(config.manifest_dir)
    _config_path(paths).write_text(json.dumps(payload, indent=2, sort_keys=True))


def set_manifest_dir(paths: LibrarianPaths, manifest_dir: Path) -> None:
    save_config(paths, LibrarianConfig(manifest_dir=manifest_dir))
