import { useState, useCallback, useRef, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { CameraRoll, PhotoIdentifier } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

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
  asset?: PhotoIdentifier | null;
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
   * Saves the processed image directly to the device gallery using CameraRoll.
   */
  saveToGallery: (
    targetUri?: string,
    albumName?: string
  ) => Promise<PhotoIdentifier | null>;

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

  /** True while ImageResizer is processing */
  isResizing: boolean;
  /** True while saving to the photo library */
  isSaving: boolean;
  /** True if resizing or saving */
  isLoading: boolean;
  /** Alias for isResizing */
  isProcessing: boolean;
  /** Last error message if any */
  error: string | null;
  /** The most recent resize result */
  result: ResizedImageResult | null;
  /** The saved gallery asset if successfully saved */
  savedAsset: PhotoIdentifier | null;
  /** Current media library permission status */
  permissionStatus: 'granted' | 'denied' | null;
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

function stripFileScheme(uri: string): string {
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}

/**
 * Custom Pure React Native hook for image resizing, quality compression,
 * gallery export, and memory cleanup using @bam.tech/react-native-image-resizer,
 * @react-native-camera-roll/camera-roll, and react-native-fs (Zero Expo).
 */
export const useImageResizer = (): UseImageResizerReturn => {
  const [isResizing, setIsResizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResizedImageResult | null>(null);
  const [savedAsset, setSavedAsset] = useState<PhotoIdentifier | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | null>(null);
  const [tempFilesCount, setTempFilesCount] = useState(0);

  // Track all generated temporary URIs for memory management & cleanup
  const tempUrisRef = useRef<Set<string>>(new Set());

  /**
   * Deletes temporary files from the device cache directory
   */
  const cleanupTempFiles = useCallback(async (specificUri?: string) => {
    try {
      if (specificUri) {
        const fsPath = stripFileScheme(specificUri);
        const exists = await RNFS.exists(fsPath);
        if (exists) {
          await RNFS.unlink(fsPath);
        }
        tempUrisRef.current.delete(specificUri);
      } else {
        const urisToDelete = Array.from(tempUrisRef.current);
        await Promise.all(
          urisToDelete.map(async (uri) => {
            try {
              const fsPath = stripFileScheme(uri);
              const exists = await RNFS.exists(fsPath);
              if (exists) {
                await RNFS.unlink(fsPath);
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
      const uris = Array.from(tempUrisRef.current);
      uris.forEach((uri) => {
        RNFS.unlink(stripFileScheme(uri)).catch(() => {});
      });
      tempUrisRef.current.clear();
    };
  }, []);

  /**
   * Requests native Android/iOS media library permissions
   */
  const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') {
        setPermissionStatus('granted');
        return true;
      }

      const apiLevel = typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(String(Platform.Version), 10);

      const permission =
        apiLevel >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

      const status = await PermissionsAndroid.request(permission);
      const isGranted = status === PermissionsAndroid.RESULTS.GRANTED;
      setPermissionStatus(isGranted ? 'granted' : 'denied');
      return isGranted;
    } catch (err: any) {
      setError(err.message || 'Permission request failed');
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  /**
   * Saves an image directly to the device gallery using @react-native-camera-roll/camera-roll
   */
  const saveToGallery = useCallback(
    async (
      targetUri?: string,
      albumName?: string
    ): Promise<PhotoIdentifier | null> => {
      const uriToSave = targetUri || result?.uri;
      if (!uriToSave) {
        setError('No image available to save');
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
          throw new Error('Photo gallery permission denied. Please enable photos access in device settings.');
        }

        const formattedUri =
          uriToSave.startsWith('file://') || uriToSave.startsWith('content://')
            ? uriToSave
            : `file://${uriToSave}`;

        const asset = await CameraRoll.saveAsset(formattedUri, {
          type: 'photo',
          album: albumName?.trim() || undefined,
        });

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
   * Resizes and compresses an image natively
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
          width = 1080,
          height = 1080,
          quality = 80,
          format = 'jpeg',
          maintainAspectRatio = true,
          base64 = false,
          albumName,
          autoSaveToGallery = false,
          autoCleanupPrevious = true,
        } = options;

        if (autoCleanupPrevious && result?.uri) {
          await cleanupTempFiles(result.uri);
        }

        const formatMap: Record<OutputFormat, 'JPEG' | 'PNG' | 'WEBP'> = {
          jpeg: 'JPEG',
          png: 'PNG',
          webp: 'WEBP',
        };
        const compressFormat = formatMap[format] || 'JPEG';
        const qualityPercent =
          format === 'png' ? 100 : Math.round(normalizeQuality(quality) * 100);

        const resized = await ImageResizer.createResizedImage(
          sourceUri,
          width || 4096,
          height || 4096,
          compressFormat,
          qualityPercent,
          0,
          undefined,
          false,
          {
            mode: maintainAspectRatio ? 'contain' : 'stretch',
            onlyScaleDown: false,
          }
        );

        tempUrisRef.current.add(resized.uri);
        setTempFilesCount(tempUrisRef.current.size);

        let sizeBytes = resized.size || 0;
        if (!sizeBytes) {
          const stat = await RNFS.stat(stripFileScheme(resized.uri));
          sizeBytes = Number(stat.size) || 0;
        }

        let base64String: string | undefined;
        if (base64) {
          base64String = await RNFS.readFile(stripFileScheme(resized.uri), 'base64');
        }

        let asset: PhotoIdentifier | null = null;
        if (autoSaveToGallery) {
          asset = await saveToGallery(resized.uri, albumName);
        }

        const processed: ResizedImageResult = {
          uri: resized.uri,
          width: resized.width,
          height: resized.height,
          sizeBytes,
          format,
          base64: base64String,
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
    isProcessing: isResizing,
    error,
    result,
    savedAsset,
    permissionStatus,
    tempFilesCount,
  };
};
