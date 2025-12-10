from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID


class FolderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class FolderCreate(FolderBase):
    pass


class FolderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)


class FolderResponse(FolderBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
