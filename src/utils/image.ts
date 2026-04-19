/**
 * Resolves a stored image path (relative or absolute) to a full URL
 * pointing at the Laravel backend's uploads directory.
 */
export function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  
  // If it's already a full URL (S3, etc.), return as is
  if (path.startsWith('http')) {
    // Only normalise if it's pointing to a local dev server that might have a different port
    if (path.includes('localhost')) {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
      return path.replace(/^http:\/\/localhost(?::\d+)?\//, `${base}/`);
    }
    return path;
  }
  
  // For relative paths, check if S3 is configured
  const s3Base = process.env.NEXT_PUBLIC_S3_BASE_URL;
  if (s3Base) {
    // Ensure one slash between base and path
    const normalizedBase = s3Base.endsWith('/') ? s3Base : `${s3Base}/`;
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return `${normalizedBase}${normalizedPath}`;
  }

  // Prepend the API base URL for relative paths as fallback
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Compresses an image file using the Canvas API.
 * 
 * @param file The original image file
 * @param maxWidth Maximum width of the compressed image
 * @param quality Compression quality (0 to 1)
 * @returns A promise that resolves to the compressed File
 */
export const compressImage = (file: File, maxWidth = 1920, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If it's not an image, just return it as-is
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    // PNG/GIF/WebP may have transparency — preserve original format to avoid black background
    const hasTransparency = file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp';
    const outputType = hasTransparency ? file.type : 'image/jpeg';

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        // For JPEG only: fill white background first (no alpha channel)
        if (outputType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed'));
            }
            const ext = outputType === 'image/png' ? '.png' : outputType === 'image/webp' ? '.webp' : '.jpg';
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const compressedFile = new File([blob], baseName + ext, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
