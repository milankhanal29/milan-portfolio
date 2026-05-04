"""Cloudinary media upload utilities with local fallback."""

import os
import uuid
from typing import Optional

from app.config import settings

# Try to import cloudinary; gracefully degrade if not installed
try:
    import cloudinary
    import cloudinary.uploader

    if settings.USE_CLOUDINARY and settings.CLOUDINARY_CLOUD_NAME:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )
        CLOUDINARY_CONFIGURED = True
    else:
        CLOUDINARY_CONFIGURED = False
except ImportError:
    CLOUDINARY_CONFIGURED = False

# Local upload directory
LOCAL_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)


async def upload_file(file_bytes: bytes, filename: str, folder: str = "portfolio") -> Optional[str]:
    """Upload a file and return the URL. Uses Cloudinary if configured, else local storage."""
    if CLOUDINARY_CONFIGURED:
        return await upload_to_cloudinary(file_bytes, filename, folder)
    return await upload_to_local(file_bytes, filename, folder)


async def upload_to_cloudinary(file_bytes: bytes, filename: str, folder: str) -> Optional[str]:
    """Upload to Cloudinary and return the secure URL."""
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            public_id=f"{uuid.uuid4().hex}_{filename}",
            resource_type="auto",
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"[CLOUDINARY] Upload failed: {e}")
        return None


async def upload_to_local(file_bytes: bytes, filename: str, folder: str) -> Optional[str]:
    """Save file locally and return the relative URL path."""
    try:
        folder_path = os.path.join(LOCAL_UPLOAD_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)

        unique_name = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(folder_path, unique_name)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        return f"/uploads/{folder}/{unique_name}"
    except Exception as e:
        print(f"[LOCAL] Upload failed: {e}")
        return None


async def delete_file(url: str) -> bool:
    """Delete a file by URL. Handles both Cloudinary and local."""
    if not url:
        return False

    if CLOUDINARY_CONFIGURED and "cloudinary" in url:
        try:
            # Extract public_id from URL
            public_id = url.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception:
            return False
    elif url.startswith("/uploads/"):
        try:
            file_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                url.lstrip("/"),
            )
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
    return False
