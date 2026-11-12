export type ScreenView = 'picker' | 'resize' | 'preview';

export type DeviceType = 'iphone' | 'pixel' | 'frameless';

export type OutputFormat = 'jpeg' | 'png' | 'webp';

export type FitMode = 'contain' | 'cover' | 'fill';

export interface ImageMetadata {
  id: string;
  name: string;
  uri: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  aspectRatio: string;
}

export interface ResizeConfig {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  quality: number; // 0.1 to 1.0 (or 10 to 100)
  format: OutputFormat;
  fitMode: FitMode;
  scalePercent: number;
  presetId?: string;
}

export interface ResizedImageResult {
  uri: string;
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  format: OutputFormat;
  processingTimeMs: number;
}

export interface RNFileDefinition {
  path: string;
  filename: string;
  folder: string;
  category: 'screen' | 'component' | 'hook' | 'util' | 'type' | 'config' | 'doc';
  description: string;
  content: string;
}
