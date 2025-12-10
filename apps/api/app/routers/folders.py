from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.models.folder import FolderCreate, FolderUpdate, FolderResponse


router = APIRouter()


@router.get("", response_model=List[FolderResponse])
async def get_folders(
    current_user: dict = Depends(get_current_user),
):
    """Get all folders for the current user."""
    supabase = get_supabase_client()

    response = (
        supabase.table("folders")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("name")
        .execute()
    )

    return response.data


@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Get a specific folder by ID."""
    supabase = get_supabase_client()

    response = (
        supabase.table("folders")
        .select("*")
        .eq("id", str(folder_id))
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found",
        )

    return response.data


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder: FolderCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new folder."""
    supabase = get_supabase_client()

    folder_data = {
        "name": folder.name,
        "user_id": current_user["id"],
    }

    response = supabase.table("folders").insert(folder_data).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create folder",
        )

    return response.data[0]


@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: UUID,
    folder: FolderUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an existing folder."""
    supabase = get_supabase_client()

    update_data = {}
    if folder.name is not None:
        update_data["name"] = folder.name

    response = (
        supabase.table("folders")
        .update(update_data)
        .eq("id", str(folder_id))
        .eq("user_id", current_user["id"])
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found",
        )

    return response.data[0]


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Delete a folder. Notes in the folder will have their folder_id set to null."""
    supabase = get_supabase_client()

    # First, update all notes in this folder to have no folder
    supabase.table("notes").update({"folder_id": None}).eq(
        "folder_id", str(folder_id)
    ).eq("user_id", current_user["id"]).execute()

    # Then delete the folder
    response = (
        supabase.table("folders")
        .delete()
        .eq("id", str(folder_id))
        .eq("user_id", current_user["id"])
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found",
        )

    return None
