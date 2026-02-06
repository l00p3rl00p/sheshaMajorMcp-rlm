import os
from typing import List
from fastapi import APIRouter, Request
from shesha.bridge.models import HealthResponse, Project, ManifestStatus
from shesha.librarian.core import LibrarianCore 
from shesha.librarian.paths import resolve_paths
from shesha.bridge.limiter import limiter

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
@limiter.limit("100/minute")
async def health_check(request: Request):
    """Check system health and Docker availability."""
    # TODO: Real docker check
    docker_ok = True 
    return HealthResponse(
        status="active",
        docker_available=docker_ok,
        version="0.5.0"
    )

@router.get("/manifest", response_model=ManifestStatus)
@limiter.limit("100/minute")
async def get_manifest(request: Request):
    """Check for local .librarian/manifest.json"""
    manifest_path = ".librarian/manifest.json"
    exists = os.path.exists(manifest_path)
    return ManifestStatus(
        exists=exists,
        path=os.path.abspath(manifest_path) if exists else None,
        valid=exists # Minimal check for now
    )

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
