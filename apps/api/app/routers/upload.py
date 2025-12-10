from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from uuid import uuid4
import mimetypes

from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.core.config import settings
from app.models.upload import UploadResponse


router = APIRouter()

ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    note_id: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Upload an image to Supabase storage."""

    # Validate file type
    content_type = file.content_type
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    # Read file content
    content = await file.read()

    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    # Generate unique filename
    ext = mimetypes.guess_extension(content_type) or ".png"
    filename = f"{uuid4()}{ext}"

    # Build file path
    if note_id:
        file_path = f"{current_user['id']}/{note_id}/{filename}"
    else:
        file_path = f"{current_user['id']}/{filename}"

    # Upload to Supabase Storage
    supabase = get_supabase_client()

    try:
        response = supabase.storage.from_(settings.storage_bucket).upload(
            file_path,
            content,
            file_options={"content-type": content_type},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )

    # Get public URL
    public_url = supabase.storage.from_(settings.storage_bucket).get_public_url(file_path)

    return UploadResponse(url=public_url, path=file_path)


@router.delete("/image/{path:path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    path: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an image from Supabase storage."""

    # Verify the file belongs to the current user
    if not path.startswith(current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this file",
        )

    supabase = get_supabase_client()

    try:
        supabase.storage.from_(settings.storage_bucket).remove([path])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}",
        )

    return None
