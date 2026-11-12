/**
 * Image calculation and resizing math utilities
 * Decoupled pure logic for dimensions, scaling, aspect ratios, and compression calculations
 */

export interface Dimensions {
  width: number;
  height: number;
}

export type FitMode = 'contain' | 'cover' | 'fill' | 'inside';

export type OutputFormat = 'jpeg' | 'png' | 'webp';

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
export function calculateTargetDimensions(
  original: Dimensions,
  requestedWidth: number,
  requestedHeight: number,
  maintainAspectRatio: boolean,
  changedDimension: 'width' | 'height'
): Dimensions {
  if (original.width <= 0 || original.height <= 0) {
    return {
      width: Math.max(1, Math.round(requestedWidth)),
      height: Math.max(1, Math.round(requestedHeight)),
    };
  }

  const aspectRatio = original.width / original.height;

  if (!maintainAspectRatio) {
    return {
      width: Math.max(1, Math.round(requestedWidth)),
      height: Math.max(1, Math.round(requestedHeight)),
    };
  }

  if (changedDimension === 'width') {
    const safeWidth = Math.max(1, Math.round(requestedWidth));
    const calculatedHeight = Math.max(1, Math.round(safeWidth / aspectRatio));
    return { width: safeWidth, height: calculatedHeight };
  } else {
    const safeHeight = Math.max(1, Math.round(requestedHeight));
    const calculatedWidth = Math.max(1, Math.round(safeHeight * aspectRatio));
    return { width: calculatedWidth, height: safeHeight };
  }
}

/**
 * Calculates dimensions based on scale percentage (e.g. 50% = 0.5)
 */
export function calculateDimensionsFromScale(
  original: Dimensions,
  scalePercent: number
): Dimensions {
  const factor = Math.max(1, scalePercent) / 100;
  return {
    width: Math.max(1, Math.round(original.width * factor)),
    height: Math.max(1, Math.round(original.height * factor)),
  };
}

/**
 * Calculates aspect ratio string (e.g. "16:9", "4:3", "1:1")
 */
export function getAspectRatioLabel(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const wRatio = Math.round(width) / divisor;
  const hRatio = Math.round(height) / divisor;

  // If ratio numbers are standard, return them; otherwise return decimal representation
  if (wRatio <= 21 && hRatio <= 21) {
    return `${wRatio}:${hRatio}`;
  }
  const ratio = (width / height).toFixed(2);
  return `${ratio}:1`;
}

/**
 * Formats bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0 || isNaN(bytes)) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, index)).toFixed(dm))} ${sizes[index]}`;
}

/**
 * Calculates compression savings percentage
 */
export function calculateSavings(
  originalBytes: number,
  resizedBytes: number
): {
  differenceBytes: number;
  percentage: number;
  isReduction: boolean;
} {
  if (!originalBytes || originalBytes <= 0 || !resizedBytes || resizedBytes <= 0) {
    return { differenceBytes: 0, percentage: 0, isReduction: false };
  }

  const diff = originalBytes - resizedBytes;
  const percentage = Math.round((diff / originalBytes) * 1000) / 10;
  return {
    differenceBytes: Math.abs(diff),
    percentage: Math.abs(percentage),
    isReduction: diff >= 0,
  };
}

/**
 * Predefined popular aspect ratio and dimension presets for mobile and social media
 */
export interface DimensionPreset {
  id: string;
  name: string;
  category: 'social' | 'web' | 'standard';
  width: number;
  height: number;
  description: string;
}

export const DIMENSION_PRESETS: DimensionPreset[] = [
  {
    id: 'ig-square',
    name: 'Instagram Square',
    category: 'social',
    width: 1080,
    height: 1080,
    description: '1:1 square post',
  },
  {
    id: 'ig-story',
    name: 'Instagram / TikTok Story',
    category: 'social',
    width: 1080,
    height: 1920,
    description: '9:16 vertical full screen',
  },
  {
    id: 'ig-portrait',
    name: 'Portrait Feed',
    category: 'social',
    width: 1080,
    height: 1350,
    description: '4:5 vertical feed',
  },
  {
    id: 'avatar',
    name: 'Profile Avatar',
    category: 'social',
    width: 400,
    height: 400,
    description: '1:1 profile picture',
  },
  {
    id: 'youtube-thumb',
    name: 'YouTube Thumbnail',
    category: 'social',
    width: 1280,
    height: 720,
    description: '16:9 HD preview',
  },
  {
    id: 'fhd',
    name: 'Full HD',
    category: 'standard',
    width: 1920,
    height: 1080,
    description: '1080p standard',
  },
  {
    id: 'hd',
    name: 'HD (720p)',
    category: 'standard',
    width: 1280,
    height: 720,
    description: '720p standard',
  },
  {
    id: 'web-thumbnail',
    name: 'Web Thumbnail',
    category: 'web',
    width: 320,
    height: 240,
    description: '4:3 light thumbnail',
  },
];
