from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from datetime import datetime

from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.models.note import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse


router = APIRouter()


@router.get("", response_model=List[NoteListResponse])
async def get_notes(
    folder_id: UUID = None,
    current_user: dict = Depends(get_current_user),
):
    """Get all notes for the current user, optionally filtered by folder."""
    supabase = get_supabase_client()

    query = (
        supabase.table("notes")
        .select("id, title, content, folder_id, created_at, updated_at")
        .eq("user_id", current_user["id"])
    )

    if folder_id:
        query = query.eq("folder_id", str(folder_id))

    response = query.order("updated_at", desc=True).execute()

    return response.data


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Get a specific note by ID."""
    supabase = get_supabase_client()

    response = (
        supabase.table("notes")
        .select("*")
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return response.data


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new note."""
    supabase = get_supabase_client()

    note_data = {
        "title": note.title,
        "content": note.content,
        "user_id": current_user["id"],
        "folder_id": str(note.folder_id) if note.folder_id else None,
    }

    response = supabase.table("notes").insert(note_data).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create note",
        )

    return response.data[0]


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: UUID,
    note: NoteUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an existing note."""
    supabase = get_supabase_client()

    # Build update data (only include non-None fields)
    update_data = {}
    if note.title is not None:
        update_data["title"] = note.title
    if note.content is not None:
        update_data["content"] = note.content
    if note.folder_id is not None:
        update_data["folder_id"] = str(note.folder_id)

    update_data["updated_at"] = datetime.utcnow().isoformat()

    response = (
        supabase.table("notes")
        .update(update_data)
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return response.data[0]


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Delete a note."""
    supabase = get_supabase_client()

    response = (
        supabase.table("notes")
        .delete()
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return None
