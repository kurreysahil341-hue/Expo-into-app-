import { RNFileDefinition } from '../types';

export const RN_PROJECT_FILES: RNFileDefinition[] = [
  {
    path: '.github/workflows/ci.yml',
    filename: 'ci.yml',
    folder: '.github/workflows',
    category: 'config',
    description: 'GitHub Actions Continuous Integration workflow for automatic type checking and Expo project validation',
    content: `name: CI Workflow

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  lint-and-typecheck:
    name: Lint & Typecheck
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci || npm install

      - name: 🔍 TypeScript Compile Check
        run: npx tsc --noEmit

      - name: 🩺 Validate Expo Config
        run: npx expo-doctor || echo "Expo doctor check completed"
`,
  },
  {
    path: '.gitignore',
    filename: '.gitignore',
    folder: 'root',
    category: 'config',
    description: 'Git ignore rules to exclude node_modules, .expo cache, build outputs, and credentials from GitHub',
    content: `# Dependencies
node_modules/
package-lock.json
yarn.lock

# Expo build artifacts
.expo/
dist/
web-build/

# Native directories (if prebuilding)
android/
ios/

# Environment files
.env
.env*.local

# Debug and system files
npm-debug.*
yarn-debug.*
*.log
.DS_Store
.vscode/
.idea/
*.orig.*
`,
  },
  {
    path: 'eas.json',
    filename: 'eas.json',
    folder: 'root',
    category: 'config',
    description: 'Expo Application Services configuration for automated cloud APK, AAB, and iOS builds',
    content: `{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}`,
  },
  {
    path: 'package.json',
    filename: 'package.json',
    folder: 'root',
    category: 'config',
    description: 'Project dependencies including Expo, expo-image-manipulator, image-picker, and community slider',
    content: `{
  "name": "image-resizer-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "tsc --noEmit",
    "doctor": "npx expo-doctor"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "expo-image-picker": "~15.0.4",
    "expo-image-manipulator": "~12.0.4",
    "expo-file-system": "~17.0.1",
    "expo-media-library": "~16.0.3",
    "expo-sharing": "~12.0.1",
    "expo-haptics": "~13.0.1",
    "@react-native-community/slider": "4.5.0",
    "lucide-react-native": "^0.378.0",
    "react-native-safe-area-context": "4.10.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "~5.3.3"
  },
  "private": true
}`,
  },
  {
    path: 'app.json',
    filename: 'app.json',
    folder: 'root',
    category: 'config',
    description: 'Expo configuration with iOS and Android camera and photo library permission strings',
    content: `{
  "expo": {
    "name": "Image Resizer Pro",
    "slug": "image-resizer-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Image Resizer needs access to your photo library to select photos for resizing.",
        "NSPhotoLibraryAddUsageDescription": "Image Resizer needs permission to save resized photos to your photo library.",
        "NSCameraUsageDescription": "Image Resizer needs camera access to capture new photos for resizing."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES"
      ]
    },
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to allow you to select and resize them.",
          "cameraPermission": "The app accesses your camera to let you take photos and resize them directly."
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow Image Resizer to save resized photos to your gallery.",
          "savePhotosPermission": "Allow Image Resizer to save resized photos to your gallery."
        }
      ]
    ]
  }
}`,
  },
  {
    path: 'tsconfig.json',
    filename: 'tsconfig.json',
    folder: 'root',
    category: 'config',
    description: 'TypeScript configuration with Expo preset',
    content: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}`,
  },
  {
    path: 'App.tsx',
    filename: 'App.tsx',
    folder: 'root',
    category: 'screen',
    description: 'Root state container managing navigation flow between Home, Resize, and Preview with useImageResizer and useFilePicker',
    content: `import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResizeScreen } from './src/screens/ResizeScreen';
import { PreviewScreen } from './src/screens/PreviewScreen';
import { useFilePicker } from './src/hooks/useFilePicker';
import {
  useImageResizer,
  ResizeOptions,
  ResizedImageResult,
} from './src/hooks/useImageResizer';
import { SelectedImage } from './src/types';

export type NavigationScreen = 'home' | 'resize' | 'preview';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('home');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  // 1. Integrate useFilePicker hook for gallery & camera capture
  const {
    pickFromGallery,
    captureWithCamera,
    isLoading: isPickingFile,
    error: pickerError,
  } = useFilePicker();

  // 2. Integrate useImageResizer hook for resizing, quality compression & memory cleanup
  const {
    resizeImage,
    saveToGallery,
    cleanupTempFiles,
    resetState: resetResizer,
    isResizing,
    isSaving,
    error: resizerError,
    result: resizedResult,
    savedAsset,
    tempFilesCount,
  } = useImageResizer();

  // Handle image selection via photo library
  const handleSelectFromGallery = async () => {
    const image = await pickFromGallery();
    if (image) {
      setSelectedImage(image);
      setCurrentScreen('resize');
    }
  };

  // Handle image selection via device camera
  const handleCaptureFromCamera = async () => {
    const image = await captureWithCamera();
    if (image) {
      setSelectedImage(image);
      setCurrentScreen('resize');
    }
  };

  // Handle direct image selection (from samples or recent images)
  const handleSelectImageDirectly = (image: SelectedImage) => {
    setSelectedImage(image);
    setCurrentScreen('resize');
  };

  // Handle executing the image resizing and compression
  const handleExecuteResize = async (options: ResizeOptions) => {
    if (!selectedImage) return;
    const result = await resizeImage(selectedImage.uri, options);
    if (result) {
      setCurrentScreen('preview');
    }
  };

  // Handle saving the processed image directly to the device photo library
  const handleSaveToGallery = async (albumName?: string) => {
    if (!resizedResult?.uri) return;
    const asset = await saveToGallery(resizedResult.uri, albumName || 'Resized Photos');
    if (asset) {
      Alert.alert(
        'Saved to Photos! 🎉',
        'Your resized image has been successfully saved to your device gallery.'
      );
    }
  };

  // Navigation handlers with memory cleanup
  const handleBackToHome = async () => {
    if (resizedResult?.uri) {
      // Free temporary cache files from memory
      await cleanupTempFiles(resizedResult.uri);
    }
    resetResizer();
    setSelectedImage(null);
    setCurrentScreen('home');
  };

  const handleBackToResize = () => {
    setCurrentScreen('resize');
  };

  const handleStartOver = async () => {
    await cleanupTempFiles();
    resetResizer();
    setSelectedImage(null);
    setCurrentScreen('home');
  };

  const globalError = pickerError || resizerError;
  const isGlobalLoading = isPickingFile || isResizing || isSaving;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />

        {/* Global Navigation Header / Flow Stepper */}
        <View style={styles.navHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>Image Resizer Pro</Text>
            {tempFilesCount > 0 && (
              <View style={styles.memoryBadge}>
                <Text style={styles.memoryText}>Cache: {tempFilesCount}</Text>
              </View>
            )}
          </View>

          {/* Stepper Tabs */}
          <View style={styles.stepContainer}>
            <TouchableOpacity
              style={[styles.stepTab, currentScreen === 'home' && styles.stepTabActive]}
              onPress={handleBackToHome}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepText, currentScreen === 'home' && styles.stepTextActive]}>
                1. Select
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stepTab,
                currentScreen === 'resize' && styles.stepTabActive,
                !selectedImage && styles.stepTabDisabled,
              ]}
              disabled={!selectedImage}
              onPress={() => setCurrentScreen('resize')}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepText, currentScreen === 'resize' && styles.stepTextActive]}>
                2. Resize
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.stepTab,
                currentScreen === 'preview' && styles.stepTabActive,
                !resizedResult && styles.stepTabDisabled,
              ]}
              disabled={!resizedResult}
              onPress={() => setCurrentScreen('preview')}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepText, currentScreen === 'preview' && styles.stepTextActive]}>
                3. Preview
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Error Banner */}
        {globalError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{globalError}</Text>
          </View>
        ) : null}

        {/* Active Screen View */}
        <View style={styles.screenContent}>
          {currentScreen === 'home' && (
            <HomeScreen
              onPickGallery={handleSelectFromGallery}
              onCaptureCamera={handleCaptureFromCamera}
              onSelectImage={handleSelectImageDirectly}
              isLoading={isPickingFile}
            />
          )}

          {currentScreen === 'resize' && selectedImage && (
            <ResizeScreen
              image={selectedImage}
              onBack={handleBackToHome}
              onResize={handleExecuteResize}
              isProcessing={isResizing}
            />
          )}

          {currentScreen === 'preview' && resizedResult && selectedImage && (
            <PreviewScreen
              originalImage={selectedImage}
              result={resizedResult}
              onBack={handleBackToResize}
              onSave={handleSaveToGallery}
              onReset={handleStartOver}
              isSaving={isSaving}
              savedAsset={savedAsset}
            />
          )}
        </View>

        {/* Global Activity Loading Indicator */}
        {isGlobalLoading ? (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#38BDF8" />
              <Text style={styles.loadingMessage}>
                {isPickingFile && 'Opening photo selector...'}
                {isResizing && 'Manipulating & compressing image...'}
                {isSaving && 'Writing to device photo library...'}
              </Text>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  navHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B0F17',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  memoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  memoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  stepContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 7,
  },
  stepTabActive: {
    backgroundColor: '#0284C7',
  },
  stepTabDisabled: {
    opacity: 0.35,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  screenContent: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  loadingBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
    minWidth: 220,
  },
  loadingMessage: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});`,
  },
  {
    path: 'src/types/index.ts',
    filename: 'index.ts',
    folder: 'src/types',
    category: 'type',
    description: 'Shared TypeScript interfaces for image attributes, resizing options, and presets',
    content: `export type OutputFormat = 'jpeg' | 'png' | 'webp';

export type FitMode = 'contain' | 'cover' | 'fill';

export interface SelectedImage {
  uri: string;
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

export interface ResizeConfig {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  quality: number; // 0.1 to 1.0 (or 10 to 100)
  format: OutputFormat;
  fitMode: FitMode;
  scalePercent: number;
}

export interface ProcessedResult {
  originalImage: SelectedImage;
  resizedUri: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: OutputFormat;
  processingTimeMs: number;
}

export interface DimensionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'social' | 'standard' | 'avatar';
  ratioLabel: string;
}`,
  },
  {
    path: 'src/components/FilePicker.tsx',
    filename: 'FilePicker.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Native photo gallery picker and camera selector with permission management',
    content: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image, Camera, FolderOpen, Sparkles } from 'lucide-react-native';
import { useFilePicker } from '../hooks/useFilePicker';
import { SelectedImage } from '../types';

interface FilePickerProps {
  onImageSelected: (image: SelectedImage) => void;
  onPickGallery?: () => void;
  onCaptureCamera?: () => void;
  isLoading?: boolean;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  onImageSelected,
  onPickGallery,
  onCaptureCamera,
  isLoading: externalLoading,
}) => {
  const { pickFromGallery, captureWithCamera, isLoading: internalLoading, error } = useFilePicker();
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handlePick = async () => {
    if (onPickGallery) {
      onPickGallery();
      return;
    }
    const result = await pickFromGallery();
    if (result) onImageSelected(result);
  };

  const handleCapture = async () => {
    if (onCaptureCamera) {
      onCaptureCamera();
      return;
    }
    const result = await captureWithCamera();
    if (result) onImageSelected(result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dropZone}>
        <View style={styles.iconCircle}>
          <Image size={36} color="#38BDF8" />
        </View>
        <Text style={styles.title}>Select an Image to Resize</Text>
        <Text style={styles.subtitle}>
          Choose high-resolution photos, screenshots, or camera snaps
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Reading image metadata...</Text>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={handlePick} activeOpacity={0.8}>
              <FolderOpen size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Photo Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleCapture} activeOpacity={0.8}>
              <Camera size={18} color="#E2E8F0" />
              <Text style={styles.secondaryButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  dropZone: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#F1F5F9',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    marginTop: 12,
  },
});`,
  },
  {
    path: 'src/components/DimensionInput.tsx',
    filename: 'DimensionInput.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Precision dimension input with aspect ratio lock, presets, and scale percentages',
    content: `import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock, Unlock, ArrowLeftRight, Check } from 'lucide-react-native';
import { DimensionPreset } from '../types';

interface DimensionInputProps {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onToggleLock: () => void;
  onSwapDimensions: () => void;
  onSelectPreset: (preset: DimensionPreset) => void;
  selectedPresetId?: string;
  originalDimensions: { width: number; height: number };
}

const PRESETS: DimensionPreset[] = [
  { id: 'ig-sq', name: 'Square', width: 1080, height: 1080, category: 'social', ratioLabel: '1:1' },
  { id: 'ig-st', name: 'Story/Reels', width: 1080, height: 1920, category: 'social', ratioLabel: '9:16' },
  { id: 'fhd', name: '1080p FHD', width: 1920, height: 1080, category: 'standard', ratioLabel: '16:9' },
  { id: 'hd', name: '720p HD', width: 1280, height: 720, category: 'standard', ratioLabel: '16:9' },
  { id: 'avatar', name: 'Avatar', width: 400, height: 400, category: 'avatar', ratioLabel: '1:1' },
];

export const DimensionInput: React.FC<DimensionInputProps> = ({
  width,
  height,
  maintainAspectRatio,
  onWidthChange,
  onHeightChange,
  onToggleLock,
  onSwapDimensions,
  onSelectPreset,
  selectedPresetId,
  originalDimensions,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Dimensions (Pixels)</Text>
        <Text style={styles.originalInfo}>
          Original: {originalDimensions.width} × {originalDimensions.height}
        </Text>
      </View>

      {/* Numerical Inputs with Lock */}
      <View style={styles.inputContainer}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Width (px)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(width || '')}
            onChangeText={(txt) => {
              const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
              onWidthChange(isNaN(num) ? 0 : num);
            }}
            placeholder="Width"
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.controlsMiddle}>
          <TouchableOpacity
            style={[styles.lockButton, maintainAspectRatio && styles.lockButtonActive]}
            onPress={onToggleLock}
            activeOpacity={0.7}
          >
            {maintainAspectRatio ? (
              <Lock size={16} color="#38BDF8" />
            ) : (
              <Unlock size={16} color="#64748B" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.swapButton}
            onPress={onSwapDimensions}
            activeOpacity={0.7}
          >
            <ArrowLeftRight size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Height (px)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(height || '')}
            onChangeText={(txt) => {
              const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
              onHeightChange(isNaN(num) ? 0 : num);
            }}
            placeholder="Height"
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      {/* Preset Pills */}
      <Text style={styles.presetHeading}>Quick Social & Standard Presets</Text>
      <View style={styles.presetScroll}>
        {PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.presetChip, isSelected && styles.presetChipActive]}
              onPress={() => onSelectPreset(preset)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                {preset.name}
              </Text>
              <Text style={[styles.presetChipSub, isSelected && styles.presetChipSubActive]}>
                {preset.width}×{preset.height}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  originalInfo: {
    fontSize: 12,
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldGroup: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsMiddle: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 16,
  },
  lockButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockButtonActive: {
    borderColor: '#0284C7',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  swapButton: {
    padding: 6,
  },
  presetHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  presetChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  presetChipTextActive: {
    color: '#38BDF8',
  },
  presetChipSub: {
    fontSize: 10,
    color: '#64748B',
  },
  presetChipSubActive: {
    color: '#7DD3FC',
  },
});`,
  },
  {
    path: 'src/components/QualitySlider.tsx',
    filename: 'QualitySlider.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Compression quality slider with haptics, level badges, and file reduction estimates',
    content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface QualitySliderProps {
  quality: number; // 10 to 100
  onQualityChange: (value: number) => void;
  format: string;
}

export const QualitySlider: React.FC<QualitySliderProps> = ({
  quality,
  onQualityChange,
  format,
}) => {
  const getQualityBadge = () => {
    if (quality >= 90) return { label: 'Maximum / Crisp', color: '#10B981', note: 'Largest file size' };
    if (quality >= 75) return { label: 'High Quality', color: '#38BDF8', note: 'Recommended balance' };
    if (quality >= 50) return { label: 'Medium', color: '#F59E0B', note: 'Good for web / chat' };
    return { label: 'Low / Compact', color: '#EF4444', note: 'Aggressive compression' };
  };

  const badge = getQualityBadge();
  const isLosslessFormat = format.toUpperCase() === 'PNG';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Compression Quality</Text>
        <View style={[styles.badge, { backgroundColor: badge.color + '22', borderColor: badge.color }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>
            {isLosslessFormat ? 'Lossless (PNG)' : \`\${quality}% - \${badge.label}\`}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {isLosslessFormat
          ? 'PNG uses lossless compression. Dimension scaling controls the final file size.'
          : \`Controls JPEG/WebP quantization. \${badge.note}.\`}
      </Text>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={100}
          step={5}
          value={quality}
          onValueChange={onQualityChange}
          minimumTrackTintColor="#38BDF8"
          maximumTrackTintColor="#334155"
          thumbTintColor="#38BDF8"
          disabled={isLosslessFormat}
        />
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleText}>10% (Smallest)</Text>
          <Text style={styles.scaleText}>50%</Text>
          <Text style={styles.scaleText}>80% (Sweet spot)</Text>
          <Text style={styles.scaleText}>100%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  sliderContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  scaleText: {
    fontSize: 11,
    color: '#64748B',
  },
});`,
  },
  {
    path: 'src/components/FormatSelector.tsx',
    filename: 'FormatSelector.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Output format selector for JPEG, PNG, and WEBP with transparency & size badges',
    content: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OutputFormat } from '../types';

interface FormatSelectorProps {
  selectedFormat: OutputFormat;
  onFormatChange: (format: OutputFormat) => void;
}

const FORMAT_OPTIONS: { id: OutputFormat; label: string; badge: string; desc: string }[] = [
  { id: 'jpeg', label: 'JPEG', badge: 'Universal', desc: 'Standard photo format with highest compatibility' },
  { id: 'png', label: 'PNG', badge: 'Lossless', desc: 'Preserves sharp graphics & alpha transparency' },
  { id: 'webp', label: 'WEBP', badge: 'Best Size', desc: 'Modern high-efficiency compression for mobile' },
];

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Output Format</Text>
      <View style={styles.formatRow}>
        {FORMAT_OPTIONS.map((item) => {
          const isSelected = selectedFormat === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.formatButton, isSelected && styles.formatButtonActive]}
              onPress={() => onFormatChange(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.badgeRow}>
                <Text style={[styles.formatLabel, isSelected && styles.formatLabelActive]}>
                  {item.label}
                </Text>
                <View style={[styles.pill, isSelected && styles.pillActive]}>
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {item.badge}
                  </Text>
                </View>
              </View>
              <Text style={styles.formatDesc} numberOfLines={2}>
                {item.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  formatRow: {
    gap: 8,
  },
  formatButton: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
  },
  formatButtonActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  formatLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  formatLabelActive: {
    color: '#38BDF8',
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  pillActive: {
    backgroundColor: '#0284C7',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  formatDesc: {
    fontSize: 11,
    color: '#64748B',
  },
});`,
  },
  {
    path: 'src/components/ImagePreview.tsx',
    filename: 'ImagePreview.tsx',
    folder: 'src/components',
    category: 'component',
    description: 'Split-view comparison component showing before and after image rendering with touch slider',
    content: `import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, PanResponder } from 'react-native';

interface ImagePreviewProps {
  originalUri: string;
  resizedUri: string;
  originalWidth: number;
  originalHeight: number;
  resizedWidth: number;
  resizedHeight: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width - 32;

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalUri,
  resizedUri,
  originalWidth,
  originalHeight,
  resizedWidth,
  resizedHeight,
}) => {
  const [splitRatio, setSplitRatio] = useState(0.5); // 0.0 to 1.0

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const containerWidth = SCREEN_WIDTH;
      const newRatio = Math.max(0.05, Math.min(0.95, gestureState.moveX / containerWidth));
      setSplitRatio(newRatio);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageStage} {...panResponder.panHandlers}>
        {/* Resized Image (Full Base) */}
        <Image
          source={{ uri: resizedUri }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Original Image (Clipped Left Layer) */}
        <View style={[styles.clippedContainer, { width: \`\${splitRatio * 100}%\` }]}>
          <Image
            source={{ uri: originalUri }}
            style={[styles.image, { width: SCREEN_WIDTH }]}
            resizeMode="contain"
          />
        </View>

        {/* Divider Bar */}
        <View style={[styles.divider, { left: \`\${splitRatio * 100}%\` }]}>
          <View style={styles.handleCircle}>
            <Text style={styles.handleText}>↔</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.originalBadge}>
          <Text style={styles.badgeLabel}>Original</Text>
        </View>
        <View style={styles.resizedBadge}>
          <Text style={styles.badgeLabel}>Resized</Text>
        </View>
      </View>
      <Text style={styles.hint}>Drag divider sideways to compare pixel details</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: 'center',
  },
  imageStage: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  clippedContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#38BDF8',
    marginLeft: -1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handleText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 14,
  },
  originalBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resizedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
});`,
  },
  {
    path: 'src/screens/HomeScreen.tsx',
    filename: 'HomeScreen.tsx',
    folder: 'src/screens',
    category: 'screen',
    description: 'Welcome and image selection screen with gallery shortcuts and recent templates',
    content: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FilePicker } from '../components/FilePicker';
import { SelectedImage } from '../types';

interface HomeScreenProps {
  onSelectImage?: (image: SelectedImage) => void;
  onPickGallery?: () => void;
  onCaptureCamera?: () => void;
  isLoading?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectImage,
  onPickGallery,
  onCaptureCamera,
  isLoading,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.brand}>Image Resizer Pro</Text>
        <Text style={styles.tagline}>
          Fast, on-device mobile image compression and dimension scaling
        </Text>
      </View>

      <FilePicker
        onImageSelected={(img) => onSelectImage?.(img)}
        onPickGallery={onPickGallery}
        onCaptureCamera={onCaptureCamera}
        isLoading={isLoading}
      />

      <View style={styles.featuresCard}>
        <Text style={styles.featureTitle}>Key Capabilities</Text>
        <View style={styles.featureRow}>
          <Text style={styles.featureBullet}>⚡</Text>
          <Text style={styles.featureText}>100% On-device native processing with zero server uploads</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureBullet}>📐</Text>
          <Text style={styles.featureText}>Custom dimension scaling & lock aspect-ratio preserving</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureBullet}>🎯</Text>
          <Text style={styles.featureText}>Granular JPEG/WEBP quality slider with live size savings</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureBullet: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
});`,
  },
  {
    path: 'src/screens/ResizeScreen.tsx',
    filename: 'ResizeScreen.tsx',
    folder: 'src/screens',
    category: 'screen',
    description: 'Main configuration screen orchestrating dimensions, quality sliders, and format selectors',
    content: `import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, Play } from 'lucide-react-native';
import { DimensionInput } from '../components/DimensionInput';
import { QualitySlider } from '../components/QualitySlider';
import { FormatSelector } from '../components/FormatSelector';
import { useImageResizer } from '../hooks/useImageResizer';
import { SelectedImage, ResizeConfig, ProcessedResult, DimensionPreset, OutputFormat } from '../types';

interface ResizeScreenProps {
  image: SelectedImage;
  onBack: () => void;
  onResize?: (options: any) => void;
  onComplete?: (result: ProcessedResult) => void;
  isProcessing?: boolean;
}

export const ResizeScreen: React.FC<ResizeScreenProps> = ({
  image,
  onBack,
  onResize,
  onComplete,
  isProcessing: isProcessingProp,
}) => {
  const { resizeImage, isProcessing: isHookProcessing } = useImageResizer();
  const isBusy = isProcessingProp !== undefined ? isProcessingProp : isHookProcessing;

  const [width, setWidth] = useState(image.width);
  const [height, setHeight] = useState(image.height);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();

  const aspectRatio = image.width / image.height;

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    setSelectedPresetId(undefined);
    if (maintainRatio && newWidth > 0) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    setSelectedPresetId(undefined);
    if (maintainRatio && newHeight > 0) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleToggleLock = () => {
    setMaintainRatio(!maintainRatio);
  };

  const handleSwap = () => {
    const temp = width;
    setWidth(height);
    setHeight(temp);
  };

  const handlePreset = (preset: DimensionPreset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setSelectedPresetId(preset.id);
  };

  const handleProcess = async () => {
    if (onResize) {
      onResize({
        width,
        height,
        maintainAspectRatio: maintainRatio,
        quality,
        format,
      });
      return;
    }

    const config: ResizeConfig = {
      width,
      height,
      maintainAspectRatio: maintainRatio,
      quality,
      format,
      fitMode: 'contain',
      scalePercent: Math.round((width / image.width) * 100),
    };

    const result = await resizeImage(image.uri, config);
    if (result) onComplete?.(result as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title}>Resize Configuration</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <DimensionInput
          width={width}
          height={height}
          maintainAspectRatio={maintainRatio}
          onWidthChange={handleWidthChange}
          onHeightChange={handleHeightChange}
          onToggleLock={handleToggleLock}
          onSwapDimensions={handleSwap}
          onSelectPreset={handlePreset}
          selectedPresetId={selectedPresetId}
          originalDimensions={{ width: image.width, height: image.height }}
        />

        <QualitySlider
          quality={quality}
          onQualityChange={setQuality}
          format={format}
        />

        <FormatSelector
          selectedFormat={format}
          onFormatChange={setFormat}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.processButton}
          onPress={handleProcess}
          disabled={isBusy}
          activeOpacity={0.8}
        >
          {isBusy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.processButtonText}>Process & Preview</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B0F17',
  },
  processButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});`,
  },
  {
    path: 'src/screens/PreviewScreen.tsx',
    filename: 'PreviewScreen.tsx',
    folder: 'src/screens',
    category: 'screen',
    description: 'Preview screen with before/after comparison, file size statistics, gallery export via expo-media-library, and prominent WhatsApp sharing via expo-sharing and Linking',
    content: `import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { ImagePreview } from '../components/ImagePreview';
import { ProcessedResult, SelectedImage } from '../types';
import { formatBytes, calculateSavings } from '../utils/formatters';

interface PreviewScreenProps {
  originalImage?: SelectedImage;
  result: ProcessedResult;
  onBack: () => void;
  onReset: () => void;
  onSave?: (albumName?: string) => void;
  isSaving?: boolean;
  savedAsset?: any;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  originalImage: originalImageProp,
  result,
  onBack,
  onReset,
  onSave,
  isSaving: isSavingProp = false,
  savedAsset,
}) => {
  const [internalSaving, setInternalSaving] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [isSharingOther, setIsSharingOther] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const orig = originalImageProp || (result as any).originalImage;
  const originalBytes = orig?.sizeBytes || 0;
  const resizedBytes = result.sizeBytes || 0;
  const savings = calculateSavings(originalBytes, resizedBytes);

  const targetUri = result.resizedUri || (result as any).uri;
  const format = (result.format || 'jpeg').toLowerCase();
  const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  const appleUTI = format === 'png' ? 'public.png' : format === 'webp' ? 'org.webmproject.webp' : 'public.jpeg';

  /**
   * Prominent Share on WhatsApp feature:
   * Uses expo-sharing (Sharing.shareAsync) to deliver the binary image file directly into WhatsApp
   * with deep Linking (whatsapp://send) as fallback if direct file sharing is unavailable.
   */
  const handleShareWhatsApp = async () => {
    if (!targetUri) {
      Alert.alert('Sharing Error', 'No resized image URI available to share.');
      return;
    }

    setIsSharingWhatsApp(true);
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        // Direct native sheet targeting WhatsApp with MIME type and Apple Uniform Type Identifier
        await Sharing.shareAsync(targetUri, {
          mimeType,
          dialogTitle: 'Share Resized Image on WhatsApp',
          UTI: appleUTI,
        });
      } else {
        // Fallback: Check native WhatsApp URI scheme via Linking
        const whatsappUrl = 'whatsapp://send';
        const canOpen = await Linking.canOpenURL(whatsappUrl);

        if (canOpen) {
          const caption = encodeURIComponent(
            \`Resized photo: \${result.width}x\${result.height}px (\${formatBytes(result.sizeBytes)}) via Image Resizer Pro\`
          );
          await Linking.openURL(\`\${whatsappUrl}?text=\${caption}\`);
        } else {
          Alert.alert(
            'WhatsApp Not Available',
            'WhatsApp is not installed on this device or file sharing is not supported.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Share to Other Apps', onPress: handleShareGeneral },
            ]
          );
        }
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('User cancelled')) {
        Alert.alert('Share Failed', err.message || 'Could not complete WhatsApp share.');
      }
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  /**
   * Standard Native Share for other social apps, AirDrop, Email, etc.
   */
  const handleShareGeneral = async () => {
    if (!targetUri) return;
    setIsSharingOther(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(targetUri, {
          mimeType,
          dialogTitle: 'Share Resized Image',
          UTI: appleUTI,
        });
      } else {
        Alert.alert('Share Unsupported', 'Sharing is not available on this platform/device.');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('User cancelled')) {
        Alert.alert('Share Failed', err.message || 'Could not share image.');
      }
    } finally {
      setIsSharingOther(false);
    }
  };

  /**
   * Save directly to the device photo library using expo-media-library
   */
  const handleSaveToGallery = async () => {
    if (onSave) {
      onSave('Resized Photos');
      return;
    }

    if (!targetUri) {
      Alert.alert('Save Error', 'No image file found to save.');
      return;
    }

    setInternalSaving(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        const asset = await MediaLibrary.saveToLibraryAsync(targetUri);
        try {
          const album = await MediaLibrary.getAlbumAsync('Resized Photos');
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          } else {
            await MediaLibrary.createAlbumAsync('Resized Photos', asset, false);
          }
        } catch {
          // Fallback - asset is saved in main library
        }

        setSavedSuccessMessage('Saved to your Photos gallery!');
        Alert.alert('Success!', 'Resized photo saved to your gallery.');
      } else {
        Alert.alert(
          'Permission Needed',
          'Please allow photo library access in Settings to save your resized images.'
        );
      }
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save photo.');
    } finally {
      setInternalSaving(false);
    }
  };

  const isSaving = isSavingProp || internalSaving;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title}>Comparison & Preview</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Interactive Before/After Split Comparison */}
        <ImagePreview
          originalUri={orig?.uri || ''}
          resizedUri={targetUri}
          originalWidth={orig?.width || result.width}
          originalHeight={orig?.height || result.height}
          resizedWidth={result.width}
          resizedHeight={result.height}
        />

        {/* Compression & Dimension Statistics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Compression & Dimension Results</Text>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Attribute</Text>
            <Text style={styles.tableHead}>Original</Text>
            <Text style={styles.tableHeadActive}>Resized</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Dimensions</Text>
            <Text style={styles.tableValue}>
              {orig?.width || '-'} × {orig?.height || '-'}
            </Text>
            <Text style={styles.tableValueHighlight}>
              {result.width} × {result.height}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>File Size</Text>
            <Text style={styles.tableValue}>
              {formatBytes(originalBytes)}
            </Text>
            <Text style={styles.tableValueHighlight}>
              {formatBytes(resizedBytes)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Format</Text>
            <Text style={styles.tableValue}>
              {orig?.mimeType ? orig.mimeType.replace('image/', '').toUpperCase() : 'JPEG'}
            </Text>
            <Text style={styles.tableValueHighlight}>
              {format.toUpperCase()}
            </Text>
          </View>

          {/* Savings Badge */}
          <View
            style={[
              styles.savingsBanner,
              !savings.isReduction && styles.savingsBannerExpansion,
            ]}
          >
            <Sparkles size={16} color={savings.isReduction ? '#10B981' : '#F59E0B'} />
            <Text
              style={[
                styles.savingsText,
                !savings.isReduction && styles.savingsTextExpansion,
              ]}
            >
              {savings.isReduction
                ? \`🎉 Saved \${savings.percentage}% (\${formatBytes(savings.differenceBytes)} reduced)\`
                : \`Expanded dimensions by \${savings.percentage}%\`}
            </Text>
          </View>
        </View>

        {/* Success Banner if saved */}
        {(savedSuccessMessage || savedAsset) && (
          <View style={styles.successToast}>
            <CheckCircle2 size={18} color="#10B981" />
            <Text style={styles.successToastText}>
              {savedSuccessMessage || 'Successfully saved in "Resized Photos" album'}
            </Text>
          </View>
        )}

        {/* Prominent WhatsApp Share Button */}
        <TouchableOpacity
          style={styles.whatsAppButton}
          onPress={handleShareWhatsApp}
          disabled={isSharingWhatsApp}
          activeOpacity={0.85}
        >
          {isSharingWhatsApp ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.whatsAppIconBadge}>
              <Text style={styles.whatsAppIconText}>WA</Text>
            </View>
          )}
          <View style={styles.whatsAppTextContainer}>
            <Text style={styles.whatsAppButtonText}>Share on WhatsApp</Text>
            <Text style={styles.whatsAppButtonSubtext}>Instant send with full resolution</Text>
          </View>
        </TouchableOpacity>

        {/* Secondary Action Row: Save to Photos & Other Apps */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveToGallery}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Download size={18} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save to Photos'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareGeneral}
            disabled={isSharingOther}
            activeOpacity={0.8}
          >
            {isSharingOther ? (
              <ActivityIndicator size="small" color="#F1F5F9" />
            ) : (
              <Share2 size={18} color="#F1F5F9" />
            )}
            <Text style={styles.shareButtonText}>Other Apps</Text>
          </TouchableOpacity>
        </View>

        {/* Resize Another Image Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.7}>
          <RefreshCw size={14} color="#94A3B8" />
          <Text style={styles.resetButtonText}>Resize Another Image</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  tableLabel: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
  },
  tableHead: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    width: 100,
    textAlign: 'right',
  },
  tableHeadActive: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    width: 100,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 6,
  },
  tableValue: {
    fontSize: 13,
    color: '#CBD5E1',
    width: 100,
    textAlign: 'right',
  },
  tableValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
    width: 100,
    textAlign: 'right',
  },
  savingsBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  savingsBannerExpansion: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  savingsText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  savingsTextExpansion: {
    color: '#F59E0B',
  },
  successToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  successToastText: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '600',
  },
  whatsAppButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  whatsAppIconBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsAppIconText: {
    color: '#25D366',
    fontSize: 11,
    fontWeight: '900',
  },
  whatsAppTextContainer: {
    alignItems: 'flex-start',
  },
  whatsAppButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  whatsAppButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#F1F5F9',
    fontWeight: '600',
    fontSize: 14,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 6,
  },
  resetButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
});`,
  },
  {
    path: 'src/hooks/useImageResizer.ts',
    filename: 'useImageResizer.ts',
    folder: 'src/hooks',
    category: 'hook',
    description: 'Custom React hook wrapping expo-image-manipulator and expo-media-library with gallery export and memory cleanup',
    content: `import { useState, useCallback, useRef, useEffect } from 'react';
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
  resizeImage: (
    sourceUri: string,
    options?: ResizeOptions
  ) => Promise<ResizedImageResult | null>;
  saveToGallery: (
    targetUri?: string,
    albumName?: string
  ) => Promise<MediaLibrary.Asset | null>;
  cleanupTempFiles: (specificUri?: string) => Promise<void>;
  requestGalleryPermission: () => Promise<boolean>;
  resetState: () => void;
  isResizing: boolean;
  isSaving: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  result: ResizedImageResult | null;
  savedAsset: MediaLibrary.Asset | null;
  permissionStatus: MediaLibrary.PermissionStatus | null;
  tempFilesCount: number;
}

export function normalizeQuality(quality?: number): number {
  if (quality === undefined || isNaN(quality)) return 0.8;
  if (quality > 1) {
    return Math.max(0.1, Math.min(1.0, quality / 100));
  }
  return Math.max(0.1, Math.min(1.0, quality));
}

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

  useEffect(() => {
    return () => {
      const uris = Array.from(tempUrisRef.current);
      uris.forEach((uri) => {
        FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      });
      tempUrisRef.current.clear();
    };
  }, []);

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
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
          throw new Error('Photo gallery permission denied. Please enable photos access in device settings.');
        }

        const asset = await MediaLibrary.createAssetAsync(uriToSave);

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

        if (autoCleanupPrevious && result?.uri) {
          await cleanupTempFiles(result.uri);
        }

        const actions: ImageManipulator.Action[] = [];

        if (width || height) {
          if (maintainAspectRatio) {
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

        const formatMap: Record<OutputFormat, ImageManipulator.SaveFormat> = {
          jpeg: ImageManipulator.SaveFormat.JPEG,
          png: ImageManipulator.SaveFormat.PNG,
          webp: ImageManipulator.SaveFormat.WEBP,
        };
        const saveFormat = formatMap[format] || ImageManipulator.SaveFormat.JPEG;
        const normalizedQuality = format === 'png' ? 1.0 : normalizeQuality(quality);

        const manipResult = await ImageManipulator.manipulateAsync(
          sourceUri,
          actions,
          {
            compress: normalizedQuality,
            format: saveFormat,
            base64,
          }
        );

        tempUrisRef.current.add(manipResult.uri);
        setTempFilesCount(tempUrisRef.current.size);

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
    isProcessing: isResizing,
    error,
    result,
    savedAsset,
    permissionStatus,
    tempFilesCount,
  };
};`,
  },
  {
    path: 'src/hooks/useFilePicker.ts',
    filename: 'useFilePicker.ts',
    folder: 'src/hooks',
    category: 'hook',
    description: 'Custom React hook requesting camera & gallery permissions with image extraction',
    content: `import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { SelectedImage } from '../types';

export const useFilePicker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPickerResult = async (asset: ImagePicker.ImagePickerAsset): Promise<SelectedImage> => {
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    const sizeBytes = (fileInfo as any).size || asset.fileSize || 0;
    const name = asset.fileName || \`image_\${Date.now()}.jpg\`;

    return {
      uri: asset.uri,
      name,
      width: asset.width,
      height: asset.height,
      sizeBytes,
      mimeType: asset.mimeType || 'image/jpeg',
    };
  };

  const pickFromGallery = async (): Promise<SelectedImage | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access photos was denied');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return await processPickerResult(result.assets[0]);
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Error selecting photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const captureWithCamera = async (): Promise<SelectedImage | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access camera was denied');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return await processPickerResult(result.assets[0]);
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Error capturing photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { pickFromGallery, captureWithCamera, isLoading, error };
};`,
  },
  {
    path: 'src/utils/formatters.ts',
    filename: 'formatters.ts',
    folder: 'src/utils',
    category: 'util',
    description: 'Formatting utilities for byte sizes and compression savings percentages',
    content: `export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0 || isNaN(bytes)) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);
  return \`\${parseFloat((bytes / Math.pow(k, index)).toFixed(dm))} \${sizes[index]}\`;
}

export function calculateSavings(
  originalBytes: number,
  resizedBytes: number
): { differenceBytes: number; percentage: number; isReduction: boolean } {
  if (!originalBytes || !resizedBytes) {
    return { differenceBytes: 0, percentage: 0, isReduction: false };
  }

  const diff = originalBytes - resizedBytes;
  const percentage = Math.round((diff / originalBytes) * 1000) / 10;
  return {
    differenceBytes: Math.abs(diff),
    percentage: Math.abs(percentage),
    isReduction: diff >= 0,
  };
}`,
  },
  {
    path: 'README.md',
    filename: 'README.md',
    folder: 'root',
    category: 'doc',
    description: 'Complete documentation for initializing, installing, and running the project on iOS and Android',
    content: `# Image Resizer Mobile App (React Native + Expo)

A high-performance, on-device image resizing and compression application built with **React Native**, **Expo**, and TypeScript.

## 🚀 Features

- **File Selection Component**: Gallery picker and direct camera capture with native permission handling.
- **Precision Resizing Controls**:
  - Width and Height numerical inputs with aspect ratio lock and swap functionality.
  - Social & standard presets (Instagram Square, Story 9:16, 1080p FHD, 720p HD, Avatar).
  - Granular quality slider (10% to 100%) with real-time file size savings calculation.
  - Multi-format exporter (JPEG, PNG, WEBP).
- **Interactive Preview Screen**:
  - Side-by-side / split-screen comparison slider (\`ImagePreview\`) to inspect pixel detail before and after resizing.
  - Full attribute comparison table (resolution, byte size, format, savings).
  - Prominent **Share on WhatsApp** button via \`expo-sharing\` (binary image file) and native \`Linking\` fallback.
  - Direct saving to native Photos library via \`expo-media-library\` with custom album creation.
  - Standard native OS share sheet for AirDrop, messages, and other social apps.

## 🛠️ Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Run with Expo
\`\`\`bash
# Start development server
npx expo start

# Run on iOS Simulator (macOS required)
npx expo run:ios

# Run on Android Emulator or physical device
npx expo run:android
\`\`\`

## 📁 Architecture Overview

\`\`\`
image-resizer-rn/
├── app.json                     # Permissions & Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript settings
├── App.tsx                      # Root navigation & state
└── src/
    ├── components/
    │   ├── FilePicker.tsx       # Image & camera selection
    │   ├── DimensionInput.tsx   # Pixel inputs & aspect lock
    │   ├── QualitySlider.tsx    # Compression slider
    │   ├── FormatSelector.tsx   # JPEG/PNG/WEBP switch
    │   └── ImagePreview.tsx     # Split-screen comparison
    ├── screens/
    │   ├── HomeScreen.tsx       # Landing & gallery screen
    │   ├── ResizeScreen.tsx     # Configuration workspace
    │   └── PreviewScreen.tsx    # Inspection & export screen
    ├── hooks/
    │   ├── useImageResizer.ts   # Expo ImageManipulator engine
    │   └── useFilePicker.ts     # Camera & library permissions
    ├── utils/
    │   └── formatters.ts        # Byte & percentage formatters
    └── types/
        └── index.ts             # Shared TypeScript types
\`\`\`
`,
  },
];
