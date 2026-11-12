import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Camera, FolderOpen, Sparkles, Check, Upload, AlertCircle } from 'lucide-react';
import { ImageMetadata } from '../../types';
import { SAMPLE_IMAGES, SampleImage } from '../../utils/sampleImages';
import { readImageFile, loadImage } from '../../utils/canvasResizer';
import { formatBytes, getAspectRatioLabel } from '../../utils/imageMath';

interface FilePickerViewProps {
  onImageSelected: (metadata: ImageMetadata) => void;
  selectedImage: ImageMetadata | null;
}

export const FilePickerView: React.FC<FilePickerViewProps> = ({
  onImageSelected,
  selectedImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const fileData = await readImageFile(file);
      const ratio = getAspectRatioLabel(fileData.width, fileData.height);

      onImageSelected({
        id: 'upload-' + Date.now(),
        name: fileData.name,
        uri: fileData.url,
        width: fileData.width,
        height: fileData.height,
        sizeBytes: fileData.sizeBytes,
        format: fileData.format,
        aspectRatio: ratio,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to read image file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = async (sample: SampleImage) => {
    setIsLoading(true);
    setError(null);
    try {
      const img = await loadImage(sample.url);
      const ratio = getAspectRatioLabel(img.naturalWidth, img.naturalHeight);

      // Estimate byte size for sample
      const approxBytes = sample.defaultWidth * sample.defaultHeight * 0.7;

      onImageSelected({
        id: sample.id,
        name: `${sample.name}.jpg`,
        uri: sample.url,
        width: img.naturalWidth || sample.defaultWidth,
        height: img.naturalHeight || sample.defaultHeight,
        sizeBytes: approxBytes,
        format: 'JPEG',
        aspectRatio: ratio,
      });
    } catch (err: any) {
      setError('Failed to load sample image. Please try uploading your own photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockCamera = () => {
    // Select the portrait sample as instant camera photo simulation
    const portrait = SAMPLE_IMAGES[1];
    handleSelectSample(portrait);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col text-slate-100">
      {/* App Header */}
      <div className="text-center mb-4 pt-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-medium mb-1.5">
          <Sparkles className="w-3 h-3" /> React Native Mobile Component
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Select Image</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Choose a photo to inspect, resize, and compress
        </p>
      </div>

      {/* Main Drop / Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative bg-slate-900/80 hover:bg-slate-900 border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 shadow-sm"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-105 transition-transform">
          <ImageIcon className="w-7 h-7" />
        </div>

        <h3 className="text-sm font-semibold text-slate-100 mb-1">
          Upload Photo from Device
        </h3>
        <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
          Tap to open file dialog or drag & drop JPG, PNG, WEBP files
        </p>

        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] text-sky-400 font-medium">
          <Upload className="w-3.5 h-3.5" />
          <span>Browse Device Photos</span>
        </div>
      </div>

      {/* Camera Capture Option */}
      <div className="flex items-center gap-2 mt-2.5">
        <button
          onClick={handleMockCamera}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          <span>Camera Snapshot</span>
        </button>
      </div>

      {error && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Curated Samples Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Test Samples
          </span>
          <span className="text-[10px] text-slate-500">1-click test</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = selectedImage?.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                disabled={isLoading}
                className={`relative group rounded-xl overflow-hidden border text-left transition-all ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-500/30'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900'
                }`}
              >
                <div className="aspect-[4/3] w-full bg-slate-800 relative overflow-hidden">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-slate-300 backdrop-blur-sm">
                    {sample.category}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  <div className="absolute bottom-1.5 left-2 right-2">
                    <p className="text-[11px] font-semibold text-white truncate">
                      {sample.name}
                    </p>
                    <p className="text-[9px] text-slate-300">
                      {sample.defaultWidth}×{sample.defaultHeight} • {sample.approxSize}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Image Information Card */}
      {selectedImage && (
        <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-sky-500/30 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-700">
            <img
              src={selectedImage.uri}
              alt="Thumb"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {selectedImage.name}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span>{selectedImage.width} × {selectedImage.height} px</span>
              <span>•</span>
              <span>{formatBytes(selectedImage.sizeBytes)}</span>
              <span>•</span>
              <span className="text-sky-400 font-semibold">{selectedImage.aspectRatio}</span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
};
