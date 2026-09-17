from django.core.exceptions import ValidationError

MAX_IMAGE_SIZE_KB = 100
MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_KB * 1024


def validate_max_image_size(image):
    """
    Validates that an uploaded image does not exceed 100 KB.
    """
    if image and hasattr(image, "size") and image.size > MAX_IMAGE_SIZE_BYTES:
        current_kb = round(image.size / 1024, 1)
        raise ValidationError(
            f"Image file size must not exceed {MAX_IMAGE_SIZE_KB} KB. (Uploaded file size: {current_kb} KB)."
        )
