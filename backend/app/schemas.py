from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    full_name: str = Field(..., max_length=100)
    email: str = Field(..., max_length=100)
    telegram_chat_id: Optional[str] = Field(None, max_length=50)
    is_active: int = Field(1, ge=0, le=1)
    role_id: int


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    telegram_chat_id: Optional[str] = Field(None, max_length=50)
    is_active: Optional[int] = Field(None, ge=0, le=1)
    role_id: Optional[int] = None


class UserRead(UserBase):
    id: int

    class Config:
        from_attributes = True


class ServerBase(BaseModel):
    hostname: str = Field(..., max_length=100)
    ip_address: str = Field(..., max_length=45)
    os_version: Optional[str] = Field(None, max_length=50)
    status: str = Field("Online", max_length=20)


class ServerCreate(ServerBase):
    pass


class ServerUpdate(BaseModel):
    hostname: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = Field(None, max_length=45)
    os_version: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=20)


class ServerRead(ServerBase):
    id: int

    class Config:
        from_attributes = True


class MetricBase(BaseModel):
    metric_name: str = Field(..., max_length=50)
    warning_threshold: float
    critical_threshold: float
    check_interval_sec: int = Field(30, ge=1)
    server_id: int


class MetricCreate(MetricBase):
    pass


class MetricUpdate(BaseModel):
    metric_name: Optional[str] = Field(None, max_length=50)
    warning_threshold: Optional[float] = None
    critical_threshold: Optional[float] = None
    check_interval_sec: Optional[int] = Field(None, ge=1)


class MetricRead(MetricBase):
    id: int

    class Config:
        from_attributes = True


class IncidentBase(BaseModel):
    severity: str = Field(..., max_length=20)
    status: str = Field("New", max_length=20)
    server_id: int
    user_id: Optional[int] = None
    downtime_minutes: Optional[int] = None


class IncidentCreate(IncidentBase):
    started_at: Optional[datetime] = None


class IncidentUpdate(BaseModel):
    severity: Optional[str] = Field(None, max_length=20)
    status: Optional[str] = Field(None, max_length=20)
    user_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    downtime_minutes: Optional[int] = None


class IncidentRead(IncidentBase):
    id: int
    started_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
