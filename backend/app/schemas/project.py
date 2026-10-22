from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ConfigurationBase(BaseModel):
    starting_capital: Decimal = Field(..., gt=0)
    target_ending_cash: Decimal = Field(..., gt=0)
    deadline: Optional[datetime] = None
    location: Optional[str] = None
    currency: str = "INR"
    opportunity_preferences: Dict[str, Any] = Field(default_factory=dict)
    resources: Dict[str, Any] = Field(default_factory=dict)
    risk_limits: Dict[str, Any] = Field(default_factory=dict)
    priorities: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = None


class ConfigurationCreate(ConfigurationBase):
    pass


class ConfigurationUpdate(BaseModel):
    starting_capital: Optional[Decimal] = Field(None, gt=0)
    target_ending_cash: Optional[Decimal] = Field(None, gt=0)
    deadline: Optional[datetime] = None
    location: Optional[str] = None
    currency: Optional[str] = None
    opportunity_preferences: Optional[Dict[str, Any]] = None
    resources: Optional[Dict[str, Any]] = None
    risk_limits: Optional[Dict[str, Any]] = None
    priorities: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class ConfigurationRead(ConfigurationBase):
    id: int
    project_id: int
    status: str
    created_at: datetime
    confirmed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectRead(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    configurations: List[ConfigurationRead] = []

    model_config = {"from_attributes": True}


class ProjectListItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
