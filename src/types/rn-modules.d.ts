declare module 'react-native' {
  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    Version: number | string;
  };

  export const PermissionsAndroid: {
    PERMISSIONS: {
      CAMERA: string;
      READ_MEDIA_IMAGES: string;
      READ_EXTERNAL_STORAGE: string;
      WRITE_EXTERNAL_STORAGE: string;
    };
    RESULTS: {
      GRANTED: 'granted';
      DENIED: 'denied';
      NEVER_ASK_AGAIN: 'never_ask_again';
    };
    request: (permission: string) => Promise<string>;
  };
}

declare module '@bam.tech/react-native-image-resizer' {
  export type ResizeFormat = 'JPEG' | 'PNG' | 'WEBP';
  export type ResizeMode = 'contain' | 'cover' | 'stretch';

  export interface ResizeResponse {
    uri: string;
    path: string;
    name: string;
    size: number;
    width: number;
    height: number;
  }

  export interface ResizeOptions {
    mode?: ResizeMode;
    onlyScaleDown?: boolean;
  }

  const ImageResizer: {
    createResizedImage(
      path: string,
      maxWidth: number,
      maxHeight: number,
      compressFormat: ResizeFormat,
      quality: number,
      rotation?: number,
      outputPath?: string,
      keepMeta?: boolean,
      options?: ResizeOptions
    ): Promise<ResizeResponse>;
  };

  export default ImageResizer;
}

declare module '@react-native-camera-roll/camera-roll' {
  export interface PhotoIdentifier {
    node: {
      id: string;
      type: string;
      image: {
        uri: string;
        filename: string | null;
        width: number;
        height: number;
      };
    };
  }

  export interface SaveToCameraRollOptions {
    type?: 'photo' | 'video' | 'auto';
    album?: string;
  }

  export const CameraRoll: {
    saveAsset(tag: string, options?: SaveToCameraRollOptions): Promise<PhotoIdentifier>;
    save(tag: string, options?: SaveToCameraRollOptions): Promise<string>;
  };
}

declare module 'react-native-fs' {
  export interface StatResult {
    size: number | string;
    isFile: () => boolean;
    isDirectory: () => boolean;
  }

  const RNFS: {
    exists(filepath: string): Promise<boolean>;
    unlink(filepath: string): Promise<void>;
    stat(filepath: string): Promise<StatResult>;
    readFile(filepath: string, encoding?: string): Promise<string>;
  };

  export default RNFS;
}
