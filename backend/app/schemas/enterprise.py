from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")


class OrganizationRead(BaseModel):
    id: int
    name: str
    slug: str
    plan: str
    settings: Dict[str, Any] = {}
    created_at: datetime
    model_config = {"from_attributes": True}


class MembershipCreate(BaseModel):
    user_email: str
    role: str = Field(default="member", pattern="^(admin|member|viewer)$")


class MembershipRead(BaseModel):
    id: int
    organization_id: int
    user_id: int
    role: str
    created_at: datetime
    user_email: Optional[str] = None
    model_config = {"from_attributes": True}


class AuditLogRead(BaseModel):
    id: int
    organization_id: Optional[int] = None
    user_id: Optional[int] = None
    project_id: Optional[int] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class ApiKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    scopes: List[str] = Field(default=["read"])
    expires_days: Optional[int] = Field(default=None, ge=1, le=365)


class ApiKeyRead(BaseModel):
    id: int
    organization_id: int
    name: str
    key_prefix: str
    scopes: List[str] = []
    is_active: bool
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    raw_key: Optional[str] = None
    model_config = {"from_attributes": True}


class WebhookCreate(BaseModel):
    url: str = Field(..., min_length=10, max_length=2048)
    events: List[str] = Field(default=["research.completed", "approval.decided"])


class WebhookRead(BaseModel):
    id: int
    organization_id: int
    url: str
    events: List[str] = []
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}
