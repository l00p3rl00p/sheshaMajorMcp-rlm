from pydantic import BaseModel
from typing import List, Optional

class HealthResponse(BaseModel):
    status: str
    docker_available: bool
    version: str
    api_key_configured: bool

class Project(BaseModel):
    id: str
    path: str
    description: Optional[str] = None

class ManifestStatus(BaseModel):
    exists: bool
    path: Optional[str]
    expected_path: str
    manifest_dir: str
    configured: bool
    valid: bool

class SettingsResponse(BaseModel):
    manifest_dir: str
    configured: bool

class ManifestDirUpdateRequest(BaseModel):
    manifest_dir: str

class ProjectCreateRequest(BaseModel):
    project_id: str
    mount_path: str

class DeleteResponse(BaseModel):
    ok: bool

class QueryRequest(BaseModel):
    project_id: str
    question: str

class QueryResponse(BaseModel):
    answer: str

class LogLine(BaseModel):
    timestamp: str
    level: str
    message: str

class CommandPlan(BaseModel):
    token: str
    command: str
    description: str
    expires_in_seconds: int

class ExecuteRequest(BaseModel):
    token: str
