declare module 'expo-image-manipulator' {
  export enum SaveFormat {
    JPEG = 'jpeg',
    PNG = 'png',
    WEBP = 'webp',
  }

  export interface ActionResize {
    resize: {
      width?: number;
      height?: number;
    };
  }

  export interface ActionRotate {
    rotate: number;
  }

  export interface ActionFlip {
    flip: {
      vertical?: boolean;
      horizontal?: boolean;
    };
  }

  export interface ActionCrop {
    crop: {
      originX: number;
      originY: number;
      width: number;
      height: number;
    };
  }

  export type Action = ActionResize | ActionRotate | ActionFlip | ActionCrop;

  export interface SaveOptions {
    compress?: number;
    format?: SaveFormat;
    base64?: boolean;
  }

  export interface ImageResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }

  export function manipulateAsync(
    uri: string,
    actions?: Action[],
    saveOptions?: SaveOptions
  ): Promise<ImageResult>;
}

declare module 'expo-media-library' {
  export enum PermissionStatus {
    UNDETERMINED = 'undetermined',
    GRANTED = 'granted',
    DENIED = 'denied',
  }

  export interface PermissionResponse {
    status: PermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
    expires: 'never' | number;
  }

  export interface Asset {
    id: string;
    filename: string;
    uri: string;
    mediaType: string;
    width: number;
    height: number;
    creationTime: number;
    modificationTime: number;
    duration: number;
    albumId?: string;
  }

  export interface Album {
    id: string;
    title: string;
    assetCount: number;
  }

  export function requestPermissionsAsync(
    writeOnly?: boolean
  ): Promise<PermissionResponse>;

  export function getPermissionsAsync(
    writeOnly?: boolean
  ): Promise<PermissionResponse>;

  export function createAssetAsync(localUri: string): Promise<Asset>;

  export function getAlbumAsync(title: string): Promise<Album | null>;

  export function createAlbumAsync(
    albumName: string,
    asset?: Asset | string,
    copyAsset?: boolean
  ): Promise<Album>;

  export function addAssetsToAlbumAsync(
    assets: Asset[] | string[],
    album: Album | string,
    copyAssets?: boolean
  ): Promise<boolean>;

  export function saveToLibraryAsync(localUri: string): Promise<void>;
}

declare module 'expo-file-system' {
  export interface FileInfo {
    exists: boolean;
    isDirectory?: boolean;
    uri: string;
    size?: number;
    modificationTime?: number;
    md5?: string;
  }

  export interface DeletionOptions {
    idempotent?: boolean;
  }

  export const cacheDirectory: string | null;
  export const documentDirectory: string | null;

  export function getInfoAsync(
    fileUri: string,
    options?: { md5?: boolean; size?: boolean }
  ): Promise<FileInfo>;

  export function deleteAsync(
    fileUri: string,
    options?: DeletionOptions
  ): Promise<void>;
}
