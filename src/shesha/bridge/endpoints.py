import os
from pathlib import Path
from typing import List
from fastapi import APIRouter, Request, HTTPException
from shesha.bridge.models import (
    HealthResponse,
    Project,
    ManifestStatus,
    SettingsResponse,
    ProjectCreateRequest,
    DeleteResponse,
    QueryRequest,
    QueryResponse,
    ManifestDirUpdateRequest,
    CapabilitiesResponse,
    ToolInfo,
)
from shesha.exceptions import ProjectExistsError
from shesha.librarian.core import LibrarianCore, ValidationError
from shesha.librarian.config import load_config, set_manifest_dir
from shesha.librarian.paths import resolve_paths
from shesha.bridge.limiter import limiter

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
@limiter.limit("100/minute")
async def health_check(request: Request):
    """Check system health and Docker availability."""
    from shesha.shesha import Shesha as SheshaClass
    docker_ok = SheshaClass._is_docker_available()
    api_key_configured = bool(os.environ.get("SHESHA_API_KEY"))
    return HealthResponse(
        status="active",
        docker_available=docker_ok,
        version="0.5.0",
        api_key_configured=api_key_configured,
    )

@router.get("/manifest", response_model=ManifestStatus)
@limiter.limit("100/minute")
async def get_manifest(request: Request):
    """Check for local .librarian/manifest.json.

    The manifest location is configured by `librarian install --manifest-dir ...`.
    The bridge reads the configured value from LIBRARIAN_HOME so it can be started
    from any working directory without "losing" the manifest path.
    """
    paths = resolve_paths()
    config = load_config(paths)
    manifest_dir = (config.manifest_dir or Path.cwd()).expanduser().resolve()
    manifest_path = manifest_dir / ".librarian" / "manifest.json"
    exists = manifest_path.exists()
    return ManifestStatus(
        exists=exists,
        path=str(manifest_path) if exists else None,
        expected_path=str(manifest_path),
        manifest_dir=str(manifest_dir),
        configured=config.manifest_dir is not None,
        valid=exists,  # Minimal check for now
    )

@router.get("/settings", response_model=SettingsResponse)
@limiter.limit("100/minute")
async def get_settings(request: Request):
    """Return bridge-visible operator settings."""
    paths = resolve_paths()
    config = load_config(paths)
    manifest_dir = (config.manifest_dir or Path.cwd()).expanduser().resolve()
    return SettingsResponse(manifest_dir=str(manifest_dir), configured=config.manifest_dir is not None)


@router.get("/capabilities", response_model=CapabilitiesResponse)
@limiter.limit("100/minute")
async def get_capabilities(request: Request):
    """Return MCP tool definitions and system prompt preview.
    
    This endpoint exposes read-only information about what the CLI/MCP can do.
    The GUI displays this information without duplicating the definitions.
    """
    from shesha.librarian.mcp import _tool_defs
    
    tools = [ToolInfo(name=t.name, description=t.description) for t in _tool_defs()]
    
    # Get system prompt preview (first 500 chars)
    try:
        from shesha.prompts.loader import PromptLoader
        loader = PromptLoader()
        raw_prompt = loader.get_raw_template("system.md")
        preview = raw_prompt[:500] + "..." if len(raw_prompt) > 500 else raw_prompt
    except Exception:
        preview = "[System prompt not available]"
    
    return CapabilitiesResponse(tools=tools, system_prompt_preview=preview)


@router.put("/settings/manifest-dir", response_model=SettingsResponse)
@limiter.limit("20/minute")
async def update_manifest_dir(request: Request, payload: ManifestDirUpdateRequest):
    """Update the directory used to locate `.librarian/manifest.json`.

    This does not create the manifest; it only tells the bridge where to look.
    The operator should run `librarian install --manifest-dir <path>` to generate it.
    """
    paths = resolve_paths()
    try:
        manifest_dir = Path(payload.manifest_dir).expanduser().resolve()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid manifest directory.")

    if not manifest_dir.exists():
        raise HTTPException(status_code=400, detail="Manifest directory does not exist.")
    if not manifest_dir.is_dir():
        raise HTTPException(status_code=400, detail="Manifest directory must be a folder.")

    try:
        set_manifest_dir(paths, manifest_dir)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save settings.")

    return SettingsResponse(manifest_dir=str(manifest_dir), configured=True)

@router.get("/projects", response_model=List[Project])
@limiter.limit("100/minute")
async def list_projects(request: Request):
    """List configured projects from the real storage backbone."""
    core: LibrarianCore = request.app.state.core
    metadata = core.list_projects_metadata()
    return [
        Project(
            id=m["id"], 
            path=m.get("mount_path", "No path bound"), 
            description=None
        ) for m in metadata
    ]

@router.post("/projects", response_model=Project)
@limiter.limit("50/minute")
async def create_project(request: Request, payload: ProjectCreateRequest):
    """Create a new project and bind a local mount path."""
    core: LibrarianCore = request.app.state.core
    try:
        mount_path = Path(payload.mount_path).expanduser()
        if not mount_path.exists():
            raise HTTPException(status_code=400, detail="Mount path does not exist.")
        if not mount_path.is_dir():
            raise HTTPException(status_code=400, detail="Mount path must be a directory.")
        core.create_project(payload.project_id, mount_path=mount_path)
        return Project(id=payload.project_id, path=str(mount_path), description=None)
    except ProjectExistsError as exc:
        raise HTTPException(status_code=409, detail="Project already exists.") from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create project.")

@router.delete("/projects/{project_id}", response_model=DeleteResponse)
@limiter.limit("50/minute")
async def delete_project(request: Request, project_id: str):
    """Delete a project and its local metadata."""
    core: LibrarianCore = request.app.state.core
    try:
        core.delete_project(project_id)
        return DeleteResponse(ok=True)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete project.")

@router.post("/query", response_model=QueryResponse)
@limiter.limit("30/minute")
async def query_project(request: Request, payload: QueryRequest):
    """Query a project using the local RLM engine."""
    core: LibrarianCore = request.app.state.core
    try:
        answer = core.query(payload.project_id, payload.question)
        return QueryResponse(answer=answer)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Project not found.") from exc
    except RuntimeError as exc:
        message = "Query failed. Ensure Docker is running and SHESHA_API_KEY is set."
        raise HTTPException(status_code=400, detail=message) from exc
    except Exception:
        raise HTTPException(status_code=500, detail="Query failed.")
