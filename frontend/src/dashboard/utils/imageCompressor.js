export const MAX_IMAGE_SIZE_KB = 100;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_KB * 1024;

export const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

export const FREE_COMPRESSION_TOOLS = [
  { name: "TinyPNG", url: "https://tinypng.com", desc: "Smart WebP, PNG & JPEG compression" },
  { name: "Squoosh", url: "https://squoosh.app", desc: "Google's web image optimizer" },
  { name: "iLoveIMG", url: "https://www.iloveimg.com/compress-image", desc: "Fast batch image compressor" },
];

/**
 * Client-side in-browser image compressor using HTML5 canvas
 * Compresses an image below 100 KB automatically without sending data anywhere.
 */
export const compressImageToMaxKB = async (file, targetMaxKB = 95) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale oversized resolutions to fit modern displays cleanly
        const maxDimension = 1400;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const targetBytes = targetMaxKB * 1024;

        const attemptCompression = (q) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Image compression failed"));
                return;
              }

              if (blob.size <= targetBytes || q <= 0.25) {
                const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                const compressedFile = new File([blob], newFileName, {
                  type: "image/webp",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                attemptCompression(q - 0.15);
              }
            },
            "image/webp",
            q
          );
        };

        attemptCompression(quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
