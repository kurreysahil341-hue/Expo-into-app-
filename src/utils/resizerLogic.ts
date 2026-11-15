/**
 * Pure logic and math helpers for React Native Image Resizer hook
 */

export type OutputFormat = 'jpeg' | 'png' | 'webp';

export interface ResizeDimensions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

/**
 * Normalizes quality input from either [0.1, 1.0] or [10, 100] percentage
 */
export function normalizeQuality(quality?: number): number {
  if (quality === undefined || isNaN(quality)) return 0.8;
  if (quality > 1) {
    return Math.max(0.1, Math.min(1.0, quality / 100));
  }
  return Math.max(0.1, Math.min(1.0, quality));
}

/**
 * Builds the array of resize actions for native image manipulation
 */
export function buildManipulatorActions(options: {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}): Array<{ resize: { width?: number; height?: number } }> {
  const { width, height, maintainAspectRatio = true } = options;
  if (!width && !height) return [];

  if (maintainAspectRatio) {
    if (width && height) {
      return [{ resize: { width, height } }];
    } else if (width) {
      return [{ resize: { width } }];
    } else {
      return [{ resize: { height } }];
    }
  }

  return [{ resize: { width, height } }];
}

/**
 * Determines file extension based on format
 */
export function getExtensionForFormat(format: OutputFormat): string {
  switch (format) {
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'jpeg':
    default:
      return 'jpg';
  }
}
