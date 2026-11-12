import { useState, useCallback, useRef, useEffect } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export type OutputFormat = 'jpeg' | 'png' | 'webp';

export interface ResizeOptions {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Compression quality slider: 0.1 to 1.0 or 10 to 100 (%) */
  quality?: number;
  /** Output image format (default: 'jpeg') */
  format?: OutputFormat;
  /** When true, preserves aspect ratio if only width or height is provided */
  maintainAspectRatio?: boolean;
  /** Whether to return base64 string (default: false to preserve memory) */
  base64?: boolean;
  /** Optional custom album name in the photo library */
  albumName?: string;
  /** Whether to automatically save to gallery once resized (default: false) */
  autoSaveToGallery?: boolean;
  /** Whether to automatically delete previous temp file on new resize (default: true) */
  autoCleanupPrevious?: boolean;
}

export interface ResizedImageResult {
  /** Local file URI in application cache */
  uri: string;
  /** Result width */
  width: number;
  /** Result height */
  height: number;
  /** Exact file size in bytes */
  sizeBytes: number;
  /** Selected format */
  format: OutputFormat;
  /** Base64 string if requested */
  base64?: string;
  /** Gallery asset info if saved */
  asset?: MediaLibrary.Asset | null;
  /** Execution time in milliseconds */
  processingTimeMs: number;
}

export interface UseImageResizerReturn {
  /**
   * Resizes an image based on custom width/height and compression slider.
   */
  resizeImage: (
    sourceUri: string,
    options?: ResizeOptions
  ) => Promise<ResizedImageResult | null>;

  /**
   * Saves the processed image directly to the device gallery using expo-media-library.
   */
  saveToGallery: (
    targetUri?: string,
    albumName?: string
  ) => Promise<MediaLibrary.Asset | null>;

  /**
   * Cleans up temporary cache files created during manipulation to free mobile memory.
   */
  cleanupTempFiles: (specificUri?: string) => Promise<void>;

  /**
   * Requests permission to access and save to the media library.
   */
  requestGalleryPermission: () => Promise<boolean>;

  /**
   * Resets error and result state.
   */
  resetState: () => void;

  /** True while ImageManipulator is processing */
  isResizing: boolean;
  /** True while saving to the photo library */
  isSaving: boolean;
  /** True if resizing or saving */
  isLoading: boolean;
  /** Last error message if any */
  error: string | null;
  /** The most recent resize result */
  result: ResizedImageResult | null;
  /** The saved gallery asset if successfully saved */
  savedAsset: MediaLibrary.Asset | null;
  /** Current media library permission status */
  permissionStatus: MediaLibrary.PermissionStatus | null;
  /** Count of temporary cache files tracked for cleanup */
  tempFilesCount: number;
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
 * Custom React Native hook for image resizing, quality compression,
 * gallery export, and memory cleanup using expo-image-manipulator & expo-media-library.
 */
export const useImageResizer = (): UseImageResizerReturn => {
  const [isResizing, setIsResizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResizedImageResult | null>(null);
  const [savedAsset, setSavedAsset] = useState<MediaLibrary.Asset | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus | null>(null);
  const [tempFilesCount, setTempFilesCount] = useState(0);

  // Track all generated temporary URIs for memory management & cleanup
  const tempUrisRef = useRef<Set<string>>(new Set());

  /**
   * Deletes temporary files from the device cache directory
   */
  const cleanupTempFiles = useCallback(async (specificUri?: string) => {
    try {
      if (specificUri) {
        const info = await FileSystem.getInfoAsync(specificUri);
        if (info.exists) {
          await FileSystem.deleteAsync(specificUri, { idempotent: true });
        }
        tempUrisRef.current.delete(specificUri);
      } else {
        const urisToDelete = Array.from(tempUrisRef.current);
        await Promise.all(
          urisToDelete.map(async (uri) => {
            try {
              const info = await FileSystem.getInfoAsync(uri);
              if (info.exists) {
                await FileSystem.deleteAsync(uri, { idempotent: true });
              }
            } catch {
              // Ignore single file deletion failures
            }
          })
        );
        tempUrisRef.current.clear();
      }
      setTempFilesCount(tempUrisRef.current.size);
    } catch (cleanupErr: any) {
      console.warn('Memory cleanup error:', cleanupErr.message);
    }
  }, []);

  /**
   * Clean up all temporary files on hook unmount to prevent cache accumulation
   */
  useEffect(() => {
    return () => {
      // Execute fire-and-forget cleanup on unmount
      const uris = Array.from(tempUrisRef.current);
      uris.forEach((uri) => {
        FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      });
      tempUrisRef.current.clear();
    };
  }, []);

  /**
   * Requests media library permissions
   */
  const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);
      return status === MediaLibrary.PermissionStatus.GRANTED;
    } catch (err: any) {
      setError(err.message || 'Permission request failed');
      return false;
    }
  }, []);

  /**
   * Saves an image directly to the device gallery using expo-media-library
   */
  const saveToGallery = useCallback(
    async (
      targetUri?: string,
      albumName?: string
    ): Promise<MediaLibrary.Asset | null> => {
      const uriToSave = targetUri || result?.uri;
      if (!uriToSave) {
        setError('No image available to save');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        // 1. Verify permissions
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
          throw new Error('Photo gallery permission denied. Please enable photos access in device settings.');
        }

        // 2. Create asset in user's media library
        const asset = await MediaLibrary.createAssetAsync(uriToSave);

        // 3. If an album name is specified, organize into the album
        if (albumName && albumName.trim().length > 0) {
          const trimmedAlbum = albumName.trim();
          const existingAlbum = await MediaLibrary.getAlbumAsync(trimmedAlbum);
          if (existingAlbum) {
            await MediaLibrary.addAssetsToAlbumAsync([asset], existingAlbum, false);
          } else {
            await MediaLibrary.createAlbumAsync(trimmedAlbum, asset, false);
          }
        }

        setSavedAsset(asset);
        return asset;
      } catch (saveErr: any) {
        const msg = saveErr.message || 'Failed to save photo to gallery';
        setError(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [result, requestGalleryPermission]
  );

  /**
   * Resizes and compresses an image
   */
  const resizeImage = useCallback(
    async (
      sourceUri: string,
      options: ResizeOptions = {}
    ): Promise<ResizedImageResult | null> => {
      if (!sourceUri) {
        setError('Source image URI is required');
        return null;
      }

      setIsResizing(true);
      setError(null);
      const startTime = Date.now();

      try {
        const {
          width,
          height,
          quality = 80,
          format = 'jpeg',
          maintainAspectRatio = true,
          base64 = false,
          albumName,
          autoSaveToGallery = false,
          autoCleanupPrevious = true,
        } = options;

        // Auto-cleanup previous temporary file if requested to optimize memory
        if (autoCleanupPrevious && result?.uri) {
          await cleanupTempFiles(result.uri);
        }

        // Construct ImageManipulator resize actions
        const actions: ImageManipulator.Action[] = [];

        if (width || height) {
          if (maintainAspectRatio) {
            // Supplying only width or height preserves aspect ratio automatically
            if (width && height) {
              actions.push({ resize: { width, height } });
            } else if (width) {
              actions.push({ resize: { width } });
            } else if (height) {
              actions.push({ resize: { height } });
            }
          } else {
            actions.push({
              resize: {
                width: width || undefined,
                height: height || undefined,
              },
            });
          }
        }

        // Format mapping
        const formatMap: Record<OutputFormat, ImageManipulator.SaveFormat> = {
          jpeg: ImageManipulator.SaveFormat.JPEG,
          png: ImageManipulator.SaveFormat.PNG,
          webp: ImageManipulator.SaveFormat.WEBP,
        };
        const saveFormat = formatMap[format] || ImageManipulator.SaveFormat.JPEG;

        // Normalize quality factor [0.1, 1.0]
        const normalizedQuality = format === 'png' ? 1.0 : normalizeQuality(quality);

        // Perform native image manipulation
        const manipResult = await ImageManipulator.manipulateAsync(
          sourceUri,
          actions,
          {
            compress: normalizedQuality,
            format: saveFormat,
            base64,
          }
        );

        // Track the new temporary file for memory cleanup
        tempUrisRef.current.add(manipResult.uri);
        setTempFilesCount(tempUrisRef.current.size);

        // Read physical file size from disk via FileSystem without holding buffer in JS
        const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
        const sizeBytes = (fileInfo as any).size || 0;

        let asset: MediaLibrary.Asset | null = null;
        if (autoSaveToGallery) {
          asset = await saveToGallery(manipResult.uri, albumName);
        }

        const processed: ResizedImageResult = {
          uri: manipResult.uri,
          width: manipResult.width,
          height: manipResult.height,
          sizeBytes,
          format,
          base64: manipResult.base64,
          asset,
          processingTimeMs: Date.now() - startTime,
        };

        setResult(processed);
        return processed;
      } catch (resizeErr: any) {
        const msg = resizeErr.message || 'Image resizing failed';
        setError(msg);
        return null;
      } finally {
        setIsResizing(false);
      }
    },
    [result, cleanupTempFiles, saveToGallery]
  );

  const resetState = useCallback(() => {
    setError(null);
    setResult(null);
    setSavedAsset(null);
  }, []);

  return {
    resizeImage,
    saveToGallery,
    cleanupTempFiles,
    requestGalleryPermission,
    resetState,
    isResizing,
    isSaving,
    isLoading: isResizing || isSaving,
    error,
    result,
    savedAsset,
    permissionStatus,
    tempFilesCount,
  };
};
