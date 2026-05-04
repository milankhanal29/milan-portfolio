"""Upload router for media files."""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.dependencies import require_admin
from app.models.user import User
from app.utils.cloudinary_upload import upload_file

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("")
async def upload_media(
    file: UploadFile = File(...),
    folder: str = "portfolio",
    admin: User = Depends(require_admin),
):
    """Upload a media file (admin only). Returns the URL."""
    if not file.content_type or not file.content_type.startswith(("image/", "video/", "application/pdf")):
        raise HTTPException(status_code=400, detail="Invalid file type")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    url = await upload_file(contents, file.filename or "upload", folder)
    if not url:
        raise HTTPException(status_code=500, detail="Upload failed")

    return {"url": url, "filename": file.filename}
