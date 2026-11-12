import { ResizeConfig, ResizedImageResult } from '../types';

/**
 * Loads an image from a URL or data URL and returns HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

/**
 * Reads a File object and extracts image info and object URL
 */
export async function readImageFile(file: File): Promise<{
  url: string;
  width: number;
  height: number;
  name: string;
  sizeBytes: number;
  format: string;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        url: objectUrl,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        name: file.name,
        sizeBytes: file.size,
        format: file.type.replace('image/', '').toUpperCase() || 'JPEG',
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid image file'));
    };
    img.src = objectUrl;
  });
}

/**
 * Resizes an image onto an offscreen canvas and converts to requested format/quality
 */
export async function resizeImage(
  sourceUrl: string,
  config: ResizeConfig
): Promise<ResizedImageResult> {
  const startTime = performance.now();
  const img = await loadImage(sourceUrl);

  const targetWidth = Math.max(1, Math.round(config.width));
  const targetHeight = Math.max(1, Math.round(config.height));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: config.format === 'png' });

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // Smooth image resizing interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Handle fit modes: contain, cover, fill
  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;

  if (config.fitMode === 'fill') {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  } else if (config.fitMode === 'contain') {
    // Fill background with white/transparent
    if (config.format !== 'png') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    const ratio = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
    const drawWidth = srcWidth * ratio;
    const drawHeight = srcHeight * ratio;
    const offsetX = (targetWidth - drawWidth) / 2;
    const offsetY = (targetHeight - drawHeight) / 2;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  } else if (config.fitMode === 'cover') {
    const ratio = Math.max(targetWidth / srcWidth, targetHeight / srcHeight);
    const drawWidth = srcWidth * ratio;
    const drawHeight = srcHeight * ratio;
    const offsetX = (targetWidth - drawWidth) / 2;
    const offsetY = (targetHeight - drawHeight) / 2;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Determine mime type and quality factor (0.0 to 1.0)
  const mimeType =
    config.format === 'png'
      ? 'image/png'
      : config.format === 'webp'
      ? 'image/webp'
      : 'image/jpeg';

  const normalizedQuality = Math.min(1, Math.max(0.1, config.quality / 100));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to generate image blob'));
      },
      mimeType,
      config.format === 'png' ? undefined : normalizedQuality
    );
  });

  const uri = URL.createObjectURL(blob);
  const processingTimeMs = Math.round(performance.now() - startTime);

  return {
    uri,
    blob,
    width: targetWidth,
    height: targetHeight,
    sizeBytes: blob.size,
    format: config.format,
    processingTimeMs,
  };
}

/**
 * Downloads a blob as a file in the browser
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
