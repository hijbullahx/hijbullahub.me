import os
from django.conf import settings
from django.core.exceptions import ValidationError
from PIL import Image

# Allowed extensions and content types for raster image uploads (SVG excluded for XSS safety)
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/webp",
    "image/gif",
}
ALLOWED_PIL_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}

# Allowed extensions and content types for document / certificate uploads (PDFs and raster images)
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_DOCUMENT_CONTENT_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/webp",
}

DEFAULT_MAX_IMAGE_SIZE = getattr(settings, "MAX_IMAGE_UPLOAD_SIZE", 5 * 1024 * 1024)       # 5 MB
DEFAULT_MAX_DOCUMENT_SIZE = getattr(settings, "MAX_DOCUMENT_UPLOAD_SIZE", 10 * 1024 * 1024) # 10 MB

# Legacy helper preserved for backward compatibility
MAX_IMAGE_SIZE_KB = 100
MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_KB * 1024


def validate_max_image_size(image):
    """Legacy helper: Validates that an uploaded image does not exceed 100 KB."""
    if image and hasattr(image, "size") and image.size > MAX_IMAGE_SIZE_BYTES:
        current_kb = round(image.size / 1024, 1)
        raise ValidationError(
            f"Image file size must not exceed {MAX_IMAGE_SIZE_KB} KB. (Uploaded file size: {current_kb} KB)."
        )


def verify_raster_image_content(file_obj, label="Image"):
    """
    Inspects actual binary content using Pillow.
    Ensures the file is a genuine, uncorrupted, and supported raster image format.
    Always resets file pointer to start.
    """
    try:
        file_obj.seek(0)
        with Image.open(file_obj) as img:
            format_name = img.format
            if format_name not in ALLOWED_PIL_FORMATS:
                return False, f"Unsupported image encoding for {label} ('{format_name}')."
            img.verify()

        # Re-open and fully load pixels to catch truncated or corrupted payloads
        file_obj.seek(0)
        with Image.open(file_obj) as img:
            img.load()

        return True, ""
    except Exception:
        return False, f"File content for {label} is not a valid or readable image."
    finally:
        try:
            file_obj.seek(0)
        except Exception:
            pass


def verify_pdf_content(file_obj, label="Document"):
    """
    Inspects actual binary content for valid PDF magic header.
    Per PDF specification (ISO 32000-1), a PDF header must contain '%PDF-'.
    Always resets file pointer to start.
    """
    try:
        file_obj.seek(0)
        header = file_obj.read(1024)
        if b"%PDF-" not in header:
            return False, f"File content for {label} does not contain a valid PDF document header."
        return True, ""
    except Exception:
        return False, f"Unable to read file content for {label}."
    finally:
        try:
            file_obj.seek(0)
        except Exception:
            pass


def validate_file_upload(file_obj, allowed_extensions, allowed_content_types, max_size, label="File"):
    """
    Validates an uploaded file's size, extension, client content type,
    and inspects actual binary content (raster image or PDF).
    Returns (True, "") on success, or (False, error_message) on failure.
    """
    if not file_obj:
        return True, ""

    filename = getattr(file_obj, "name", "")
    _, ext = os.path.splitext(filename)
    ext_lower = ext.lower()

    # 1. Check extension allowlist
    if ext_lower not in allowed_extensions:
        allowed_str = ", ".join(sorted(allowed_extensions))
        return False, f"Invalid file format for {label} ('{ext}'). Allowed extensions: {allowed_str}."

    # 2. Check file size
    size = getattr(file_obj, "size", 0)
    if size > max_size:
        max_mb = max_size / (1024 * 1024)
        current_mb = size / (1024 * 1024)
        return False, f"{label} size ({current_mb:.1f} MB) exceeds maximum allowed limit of {max_mb:.0f} MB."

    # 3. Check client content type if provided
    content_type = getattr(file_obj, "content_type", None)
    if content_type and content_type.lower() not in allowed_content_types:
        return False, f"Invalid content type for {label} ('{content_type}')."

    # 4. Deep binary inspection based on file type
    if ext_lower == ".pdf":
        return verify_pdf_content(file_obj, label=label)
    elif ext_lower in ALLOWED_IMAGE_EXTENSIONS:
        return verify_raster_image_content(file_obj, label=label)

    return True, ""


def validate_uploaded_image(file_obj, field_name="Image", max_size=None):
    """Convenience validator for image uploads (enforces raster inspection)."""
    limit = max_size or getattr(settings, "MAX_IMAGE_UPLOAD_SIZE", DEFAULT_MAX_IMAGE_SIZE)
    return validate_file_upload(
        file_obj,
        allowed_extensions=ALLOWED_IMAGE_EXTENSIONS,
        allowed_content_types=ALLOWED_IMAGE_CONTENT_TYPES,
        max_size=limit,
        label=field_name,
    )


def validate_uploaded_document(file_obj, field_name="Document/Certificate", max_size=None):
    """Convenience validator for document and certificate uploads (PDF or raster image)."""
    limit = max_size or getattr(settings, "MAX_DOCUMENT_UPLOAD_SIZE", DEFAULT_MAX_DOCUMENT_SIZE)
    return validate_file_upload(
        file_obj,
        allowed_extensions=ALLOWED_DOCUMENT_EXTENSIONS,
        allowed_content_types=ALLOWED_DOCUMENT_CONTENT_TYPES,
        max_size=limit,
        label=field_name,
    )
