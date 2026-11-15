/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  FolderTree,
  Code2,
  Sliders,
  Image as ImageIcon,
  Eye,
  Download,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import {
  ScreenView,
  DeviceType,
  ImageMetadata,
  ResizeConfig,
  ResizedImageResult,
  OutputFormat,
} from './types';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { MobileFrame } from './components/mobile/MobileFrame';
import { FilePickerView } from './components/mobile/FilePickerView';
import { ResizeControlsView } from './components/mobile/ResizeControlsView';
import { PreviewView } from './components/mobile/PreviewView';
import { ProjectStructureViewer } from './components/explorer/ProjectStructureViewer';
import { resizeImage } from './utils/canvasResizer';
import { exportReactNativeProjectZip, downloadProjectZip } from './utils/zipExporter';

export default function App() {
  // Mobile Simulator state
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('resize');
  const [deviceType, setDeviceType] = useState<DeviceType>('iphone');
  const [layoutMode, setLayoutMode] = useState<'split' | 'mobile-only' | 'code-only'>('split');

  // Active image metadata (default to Mountain Lake sample)
  const defaultSample = SAMPLE_IMAGES[0];
  const [selectedImage, setSelectedImage] = useState<ImageMetadata>({
    id: defaultSample.id,
    name: `${defaultSample.name}.jpg`,
    uri: defaultSample.url,
    width: defaultSample.defaultWidth,
    height: defaultSample.defaultHeight,
    sizeBytes: 1850000,
    format: 'JPEG',
    aspectRatio: '16:9',
  });

  // Resize configuration
  const [resizeConfig, setResizeConfig] = useState<ResizeConfig>({
    width: 1080,
    height: 720,
    maintainAspectRatio: true,
    quality: 80,
    format: 'jpeg',
    fitMode: 'contain',
    scalePercent: 56,
  });

  // Processed image result
  const [processedResult, setProcessedResult] = useState<ResizedImageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);

  // Auto-process initial sample on startup
  useEffect(() => {
    let isMounted = true;
    const runInitialResize = async () => {
      try {
        const res = await resizeImage(selectedImage.uri, resizeConfig);
        if (isMounted) {
          setProcessedResult(res);
        }
      } catch (err) {
        console.warn('Initial sample resize notice:', err);
      }
    };
    runInitialResize();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProcessResize = async () => {
    setIsProcessing(true);
    try {
      const res = await resizeImage(selectedImage.uri, resizeConfig);
      setProcessedResult(res);
      setCurrentScreen('preview');
    } catch (err) {
      console.error('Resize failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectImage = (meta: ImageMetadata) => {
    setSelectedImage(meta);
    // Initialize target dimensions proportionally
    const defaultTargetWidth = Math.min(meta.width, 1080);
    const aspect = meta.width / meta.height;
    const defaultTargetHeight = Math.round(defaultTargetWidth / aspect);

    setResizeConfig((prev) => ({
      ...prev,
      width: defaultTargetWidth,
      height: defaultTargetHeight,
      scalePercent: Math.round((defaultTargetWidth / meta.width) * 100),
    }));
    setCurrentScreen('resize');
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const blob = await exportReactNativeProjectZip();
      downloadProjectZip(blob, 'image-resizer-rn.zip');
    } catch (err) {
      console.error('Error exporting zip:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm lg:text-base text-white tracking-tight">
                  React Native Image Resizer
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Mobile Project & Simulator
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                File selection • Dimension & quality controls • Preview screen
              </p>
            </div>
          </div>

          {/* Navigation & Layout View Toggles */}
          <div className="flex items-center gap-2">
            {/* Layout switch */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setLayoutMode('split')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  layoutMode === 'split'
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Split View: Simulator + Code"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Studio Split</span>
              </button>
              <button
                onClick={() => setLayoutMode('mobile-only')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  layoutMode === 'mobile-only'
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile Simulator Only"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simulator</span>
              </button>
              <button
                onClick={() => setLayoutMode('code-only')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  layoutMode === 'code-only'
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Code & Architecture Only"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Explorer</span>
              </button>
            </div>

            {/* Export RN Project (.zip) CTA */}
            <button
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {isExportingZip ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Export RN Project (.zip)</span>
              <span className="sm:hidden">Export ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 lg:p-6 gap-6">
        {/* Left Side: Mobile App Simulator */}
        {(layoutMode === 'split' || layoutMode === 'mobile-only') && (
          <div
            className={`flex flex-col items-center justify-start ${
              layoutMode === 'split' ? 'w-full lg:w-[420px] shrink-0' : 'w-full max-w-lg mx-auto'
            }`}
          >
            {/* Mobile Controls Toolbar */}
            <div className="w-full max-w-[380px] mb-3 flex items-center justify-between px-1">
              {/* Screen Flow Breadcrumbs / Tabs */}
              <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setCurrentScreen('picker')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    currentScreen === 'picker'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Select</span>
                </button>
                <button
                  onClick={() => setCurrentScreen('resize')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    currentScreen === 'resize'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Resize</span>
                </button>
                <button
                  onClick={() => {
                    if (!processedResult) handleProcessResize();
                    else setCurrentScreen('preview');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    currentScreen === 'preview'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>

              {/* Device Frame skin toggle */}
              <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] text-slate-400">
                <button
                  onClick={() => setDeviceType('iphone')}
                  className={`px-2 py-1 rounded transition-colors ${
                    deviceType === 'iphone' ? 'bg-slate-800 text-white font-bold' : 'hover:text-white'
                  }`}
                  title="iPhone 15 Pro Frame"
                >
                  iOS
                </button>
                <button
                  onClick={() => setDeviceType('pixel')}
                  className={`px-2 py-1 rounded transition-colors ${
                    deviceType === 'pixel' ? 'bg-slate-800 text-white font-bold' : 'hover:text-white'
                  }`}
                  title="Google Pixel 8 Frame"
                >
                  Android
                </button>
                <button
                  onClick={() => setDeviceType('frameless')}
                  className={`px-2 py-1 rounded transition-colors ${
                    deviceType === 'frameless' ? 'bg-slate-800 text-white font-bold' : 'hover:text-white'
                  }`}
                  title="Frameless View"
                >
                  Flat
                </button>
              </div>
            </div>

            {/* The Phone Device Frame */}
            <MobileFrame deviceType={deviceType}>
              {currentScreen === 'picker' && (
                <FilePickerView
                  onImageSelected={handleSelectImage}
                  selectedImage={selectedImage}
                />
              )}

              {currentScreen === 'resize' && (
                <ResizeControlsView
                  image={selectedImage}
                  config={resizeConfig}
                  onChangeConfig={setResizeConfig}
                  onProceedToPreview={handleProcessResize}
                  isProcessing={isProcessing}
                />
              )}

              {currentScreen === 'preview' && processedResult && (
                <PreviewView
                  originalImage={selectedImage}
                  result={processedResult}
                  onBackToResize={() => setCurrentScreen('resize')}
                  onReset={() => setCurrentScreen('picker')}
                />
              )}
            </MobileFrame>

            <div className="mt-3 text-center">
              <span className="text-[11px] text-slate-500">
                Active Simulator Screen: <strong className="text-slate-300 capitalize">{currentScreen} Screen</strong>
              </span>
            </div>
          </div>
        )}

        {/* Right Side: Project Architecture & Code Explorer */}
        {(layoutMode === 'split' || layoutMode === 'code-only') && (
          <div className="flex-1 flex overflow-hidden min-w-0">
            <ProjectStructureViewer />
          </div>
        )}
      </main>
    </div>
  );
}
