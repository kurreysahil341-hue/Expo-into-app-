import React, { useState, useRef } from 'react';
import {
  Download,
  Share2,
  RefreshCw,
  ArrowLeft,
  Check,
  Columns,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { ImageMetadata, ResizedImageResult } from '../../types';
import { formatBytes, calculateSavings } from '../../utils/imageMath';
import { triggerFileDownload } from '../../utils/canvasResizer';

interface PreviewViewProps {
  originalImage: ImageMetadata;
  result: ResizedImageResult;
  onBackToResize: () => void;
  onReset: () => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({
  originalImage,
  result,
  onBackToResize,
  onReset,
}) => {
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'split' | 'side' | 'resized'>('split');
  const [savedAlert, setSavedAlert] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const savings = calculateSavings(originalImage.sizeBytes, result.sizeBytes);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPercent(pct);
  };

  const handleDownload = () => {
    const ext = result.format === 'jpeg' ? 'jpg' : result.format;
    const baseName = originalImage.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_resized_${result.width}x${result.height}.${ext}`;
    triggerFileDownload(result.blob, filename);
    setSavedAlert('Image saved to downloads!');
    setTimeout(() => setSavedAlert(null), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const file = new File([result.blob], `resized.${result.format}`, {
          type: result.blob.type,
        });
        await navigator.share({
          files: [file],
          title: 'Resized Image',
        });
      } catch (err) {
        // Ignored or cancelled
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 text-slate-100">
      {/* Top bar with back and view toggles */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToResize}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1 px-2 rounded-lg bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Adjust Options</span>
        </button>

        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-semibold">
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 rounded-md transition-colors ${
              viewMode === 'split' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('side')}
            className={`px-2 py-1 rounded-md transition-colors ${
              viewMode === 'side' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Side
          </button>
          <button
            onClick={() => setViewMode('resized')}
            className={`px-2 py-1 rounded-md transition-colors ${
              viewMode === 'resized' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Output
          </button>
        </div>
      </div>

      {/* Interactive Comparison Stage */}
      {viewMode === 'split' && (
        <div className="relative">
          <div
            ref={containerRef}
            onPointerDown={handlePointerMove}
            onPointerMove={(e) => {
              if (e.buttons === 1) handlePointerMove(e);
            }}
            className="w-full h-56 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative select-none cursor-ew-resize shadow-inner"
          >
            {/* Background: Resized Image */}
            <img
              src={result.uri}
              alt="Resized output"
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Clipped Foreground: Original Image */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
              style={{ width: `${splitPercent}%` }}
            >
              <img
                src={originalImage.uri}
                alt="Original source"
                className="w-full h-full object-contain max-w-none"
                style={{
                  width: containerRef.current?.clientWidth || 340,
                }}
              />
            </div>

            {/* Split Bar with drag handle */}
            <div
              className="absolute inset-y-0 w-0.5 bg-sky-400 pointer-events-none shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              style={{ left: `${splitPercent}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
                ↔
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-bold text-slate-300">
              Original
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-sky-500/80 backdrop-blur-sm text-[10px] font-bold text-white">
              Resized
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-1">
            Drag slider left / right to compare sharpness & compression
          </p>
        </div>
      )}

      {viewMode === 'side' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 mb-1">Original</span>
            <div className="w-full h-36 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={originalImage.uri}
                alt="Original"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {originalImage.width}×{originalImage.height}
            </span>
          </div>

          <div className="bg-slate-900 rounded-xl p-2 border border-sky-500/40 flex flex-col items-center">
            <span className="text-[10px] font-bold text-sky-400 mb-1">Resized Output</span>
            <div className="w-full h-36 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={result.uri}
                alt="Resized"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span className="text-[10px] text-sky-400 font-semibold mt-1">
              {result.width}×{result.height}
            </span>
          </div>
        </div>
      )}

      {viewMode === 'resized' && (
        <div className="w-full h-56 rounded-2xl bg-slate-950 border border-sky-500/30 overflow-hidden flex items-center justify-center p-2">
          <img
            src={result.uri}
            alt="Resized output"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Comparison Metrics Card */}
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-bold text-slate-200">Comparison Metrics</span>
          <span className="text-[10px] text-slate-500">Processed in {result.processingTimeMs}ms</span>
        </div>

        <div className="grid grid-cols-3 py-2 text-slate-400 border-b border-slate-800/60 font-medium">
          <span>Metric</span>
          <span className="text-right">Original</span>
          <span className="text-right text-sky-400 font-bold">Resized</span>
        </div>

        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/40">
          <span className="text-slate-400">Dimensions</span>
          <span className="text-right text-slate-300">
            {originalImage.width} × {originalImage.height}
          </span>
          <span className="text-right text-sky-400 font-bold">
            {result.width} × {result.height}
          </span>
        </div>

        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/40">
          <span className="text-slate-400">File Size</span>
          <span className="text-right text-slate-300">
            {formatBytes(originalImage.sizeBytes)}
          </span>
          <span className="text-right text-sky-400 font-bold">
            {formatBytes(result.sizeBytes)}
          </span>
        </div>

        <div className="grid grid-cols-3 py-1.5">
          <span className="text-slate-400">Format</span>
          <span className="text-right text-slate-300">{originalImage.format}</span>
          <span className="text-right text-sky-400 font-bold uppercase">
            {result.format}
          </span>
        </div>

        {/* Savings banner */}
        <div
          className={`mt-2.5 p-2 rounded-xl flex items-center justify-center gap-1.5 border ${
            savings.isReduction
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs font-bold">
            {savings.isReduction
              ? `Saved ${savings.percentage}% (${formatBytes(savings.differenceBytes)} reduction)`
              : `Scaled up by ${savings.percentage}%`}
          </span>
        </div>
      </div>

      {savedAlert && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedAlert}</span>
        </div>
      )}

      {/* Prominent WhatsApp Share Button */}
      <button
        onClick={() => {
          const caption = `Resized image: ${result.width}x${result.height} px • ${formatBytes(result.sizeBytes)} (${savings.percentage}% reduced) via Image Resizer Pro`;
          if (navigator.share) {
            try {
              const file = new File([result.blob], `resized_${result.width}x${result.height}.${result.format}`, {
                type: result.blob.type,
              });
              navigator.share({
                files: [file],
                title: 'Share on WhatsApp',
                text: caption,
              }).catch(() => {});
            } catch {
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, '_blank');
            }
          } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, '_blank');
          }
          setSavedAlert('WhatsApp share initiated! Downloaded image ready to send.');
          setTimeout(() => setSavedAlert(null), 3500);
        }}
        className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white font-bold rounded-xl shadow-lg shadow-[#25D366]/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.173.449.741.964 1.201.662.591 1.221.774 1.394.861.173.086.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
        </svg>
        <span>Share on WhatsApp</span>
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          onClick={handleDownload}
          className="flex-1 py-2.5 px-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save to Photos</span>
        </button>

        <button
          onClick={handleShare}
          className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5 text-xs"
          title="Share to Other Apps"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Other Apps</span>
        </button>
      </div>

      {/* Resize another button */}
      <button
        onClick={onReset}
        className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Resize Another Photo</span>
      </button>
    </div>
  );
};
