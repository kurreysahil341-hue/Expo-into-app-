import React from 'react';
import {
  Lock,
  Unlock,
  ArrowLeftRight,
  Sliders,
  Check,
  Maximize2,
  Crop,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ImageMetadata, ResizeConfig, OutputFormat, FitMode } from '../../types';
import {
  DIMENSION_PRESETS,
  DimensionPreset,
  calculateTargetDimensions,
  calculateDimensionsFromScale,
  formatBytes,
} from '../../utils/imageMath';

interface ResizeControlsViewProps {
  image: ImageMetadata;
  config: ResizeConfig;
  onChangeConfig: (newConfig: ResizeConfig) => void;
  onProceedToPreview: () => void;
  isProcessing: boolean;
}

export const ResizeControlsView: React.FC<ResizeControlsViewProps> = ({
  image,
  config,
  onChangeConfig,
  onProceedToPreview,
  isProcessing,
}) => {
  const handleWidthChange = (val: number) => {
    const updated = calculateTargetDimensions(
      { width: image.width, height: image.height },
      val,
      config.height,
      config.maintainAspectRatio,
      'width'
    );
    onChangeConfig({
      ...config,
      width: updated.width,
      height: updated.height,
      presetId: undefined,
      scalePercent: Math.round((updated.width / image.width) * 100),
    });
  };

  const handleHeightChange = (val: number) => {
    const updated = calculateTargetDimensions(
      { width: image.width, height: image.height },
      config.width,
      val,
      config.maintainAspectRatio,
      'height'
    );
    onChangeConfig({
      ...config,
      width: updated.width,
      height: updated.height,
      presetId: undefined,
      scalePercent: Math.round((updated.width / image.width) * 100),
    });
  };

  const handleToggleLock = () => {
    onChangeConfig({
      ...config,
      maintainAspectRatio: !config.maintainAspectRatio,
    });
  };

  const handleSwap = () => {
    onChangeConfig({
      ...config,
      width: config.height,
      height: config.width,
      presetId: undefined,
    });
  };

  const handleApplyPreset = (preset: DimensionPreset) => {
    onChangeConfig({
      ...config,
      width: preset.width,
      height: preset.height,
      presetId: preset.id,
      scalePercent: Math.round((preset.width / image.width) * 100),
    });
  };

  const handleScalePercent = (pct: number) => {
    const dims = calculateDimensionsFromScale(
      { width: image.width, height: image.height },
      pct
    );
    onChangeConfig({
      ...config,
      width: dims.width,
      height: dims.height,
      scalePercent: pct,
      presetId: undefined,
    });
  };

  const isLossless = config.format === 'png';

  const getQualityLabel = (q: number) => {
    if (isLossless) return { label: 'Lossless PNG', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (q >= 90) return { label: 'Max Quality (Heavy)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (q >= 75) return { label: 'High Quality (Balanced)', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    if (q >= 50) return { label: 'Medium (Web / Social)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Low (Aggressive Savings)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const qualityBadge = getQualityLabel(config.quality);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 text-slate-100">
      {/* Current Image Mini Strip */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
          <img src={image.uri} alt="Thumb" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">{image.name}</p>
          <p className="text-[10px] text-slate-400">
            Source: <span className="text-slate-300">{image.width} × {image.height} px</span> ({formatBytes(image.sizeBytes)})
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
          {image.aspectRatio}
        </span>
      </div>

      {/* 1. Dimension Inputs */}
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Dimensions (Pixels)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Target: {config.width} × {config.height}
          </span>
        </div>

        {/* Inputs + Lock + Swap row */}
        <div className="flex items-center gap-2">
          {/* Width */}
          <div className="flex-1">
            <label className="block text-[10px] text-slate-400 font-medium mb-1">
              Width (px)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={config.width || ''}
              onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3 py-2 text-sm font-semibold text-white outline-none"
            />
          </div>

          {/* Controls: Lock Aspect Ratio & Swap */}
          <div className="flex flex-col items-center justify-center gap-1 pt-4">
            <button
              onClick={handleToggleLock}
              title={config.maintainAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
              className={`p-2 rounded-lg border transition-colors ${
                config.maintainAspectRatio
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {config.maintainAspectRatio ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={handleSwap}
              title="Swap Width and Height"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
          </div>

          {/* Height */}
          <div className="flex-1">
            <label className="block text-[10px] text-slate-400 font-medium mb-1">
              Height (px)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={config.height || ''}
              onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3 py-2 text-sm font-semibold text-white outline-none"
            />
          </div>
        </div>

        {/* Quick Scale Buttons */}
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-medium mr-1">Scale:</span>
          {[25, 50, 75, 100, 150].map((pct) => (
            <button
              key={pct}
              onClick={() => handleScalePercent(pct)}
              className={`flex-1 py-1 px-1 rounded-md text-[10px] font-semibold transition-colors ${
                config.scalePercent === pct && !config.presetId
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* 2. Quick Presets */}
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Social & Resolution Presets
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {DIMENSION_PRESETS.map((preset) => {
            const isSelected = config.presetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold truncate">{preset.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-sky-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {preset.width} × {preset.height} px
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Quality Slider */}
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Compression Quality
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${qualityBadge.color}`}>
            {qualityBadge.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>{config.quality}% Compression</span>
          <span className="text-[10px] text-slate-500">
            {isLossless ? 'PNG is lossless' : `${Math.round(100 - config.quality)}% reduction`}
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={config.quality}
          disabled={isLossless}
          onChange={(e) =>
            onChangeConfig({ ...config, quality: parseInt(e.target.value, 10) })
          }
          className="w-full accent-sky-400 cursor-pointer disabled:opacity-40 h-2 bg-slate-950 rounded-lg"
        />

        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
          <span>10% (Lowest size)</span>
          <span>50%</span>
          <span>80% (Sweet spot)</span>
          <span>100% (Crisp)</span>
        </div>
      </div>

      {/* 4. Format & Fit Mode */}
      <div className="grid grid-cols-2 gap-3">
        {/* Output Format */}
        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
            Format
          </label>
          <div className="flex flex-col gap-1">
            {(['jpeg', 'png', 'webp'] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => onChangeConfig({ ...config, format: fmt })}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase flex items-center justify-between transition-colors ${
                  config.format === fmt
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{fmt}</span>
                {config.format === fmt && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Fit Mode */}
        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
            Fit Mode
          </label>
          <div className="flex flex-col gap-1">
            {(
              [
                { id: 'contain', label: 'Contain' },
                { id: 'cover', label: 'Cover' },
                { id: 'fill', label: 'Stretch' },
              ] as { id: FitMode; label: string }[]
            ).map((fit) => (
              <button
                key={fit.id}
                onClick={() => onChangeConfig({ ...config, fitMode: fit.id })}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize flex items-center justify-between transition-colors ${
                  config.fitMode === fit.id
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{fit.label}</span>
                {config.fitMode === fit.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Process CTA Button */}
      <button
        onClick={onProceedToPreview}
        disabled={isProcessing}
        className="w-full mt-2 py-3.5 px-4 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Processing Canvas...</span>
          </div>
        ) : (
          <>
            <span className="text-sm">Resize & Compare Preview</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
