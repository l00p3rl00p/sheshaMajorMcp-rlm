from pydantic import BaseModel
from typing import List, Optional

class HealthResponse(BaseModel):
    status: str
    docker_available: bool
    version: str

class Project(BaseModel):
    id: str
    path: str
    description: Optional[str] = None

class ManifestStatus(BaseModel):
    exists: bool
    path: Optional[str]
    valid: bool

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
