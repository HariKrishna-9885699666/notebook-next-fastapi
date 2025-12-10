from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = ""
    folder_id: Optional[UUID] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    folder_id: Optional[UUID] = None


class NoteResponse(NoteBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NoteListResponse(BaseModel):
    id: UUID
    title: str
    content: str
    folder_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
