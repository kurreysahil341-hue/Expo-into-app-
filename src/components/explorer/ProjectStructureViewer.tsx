import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  FileJson,
  FileText,
  Copy,
  Check,
  Download,
  FolderOpen,
  Layers,
  Cpu,
  BookOpen,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Terminal,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { RN_PROJECT_FILES } from '../../data/rnProjectFiles';
import { RNFileDefinition } from '../../types';
import { exportReactNativeProjectZip, downloadProjectZip } from '../../utils/zipExporter';

interface ProjectStructureViewerProps {
  onSelectComponentToSimulate?: (category: string) => void;
}

export const ProjectStructureViewer: React.FC<ProjectStructureViewerProps> = () => {
  const hookFile = RN_PROJECT_FILES.find((f) => f.path === 'src/hooks/useImageResizer.ts') || RN_PROJECT_FILES[0];
  const [selectedFile, setSelectedFile] = useState<RNFileDefinition>(hookFile);
  const [copied, setCopied] = useState<boolean>(false);
  const [gitCmdsCopied, setGitCmdsCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'architecture' | 'github'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyGitCommands = () => {
    const cmds = `git init
git add .
git commit -m "feat: initial commit for Image Resizer Mobile app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/image-resizer-mobile.git
git push -u origin main`;
    navigator.clipboard.writeText(cmds);
    setGitCmdsCopied(true);
    setTimeout(() => setGitCmdsCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const blob = await exportReactNativeProjectZip();
      downloadProjectZip(blob, 'image-resizer-react-native.zip');
    } catch (err) {
      console.error('Failed to export zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getFileIcon = (file: RNFileDefinition) => {
    if (file.filename.endsWith('.yml') || file.filename.endsWith('.yaml')) {
      return <FileText className="w-4 h-4 text-orange-400 shrink-0" />;
    }
    if (file.filename === '.gitignore') {
      return <FileCode className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (file.filename.endsWith('.json')) {
      return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (file.filename.endsWith('.md')) {
      return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (file.category === 'component') {
      return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (file.category === 'screen') {
      return <Layers className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    if (file.category === 'hook') {
      return <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
    return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  // Group files by folder
  const groupedFolders = RN_PROJECT_FILES.reduce((acc, file) => {
    if (!acc[file.folder]) acc[file.folder] = [];
    acc[file.folder].push(file);
    return acc;
  }, {} as Record<string, RNFileDefinition[]>);

  const folderOrder = [
    'root',
    '.github/workflows',
    'src/components',
    'src/screens',
    'src/hooks',
    'src/utils',
    'src/types',
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              React Native Project Architecture
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Expo / RN 0.74+
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Production modular structure for file selection, dimension controls, quality sliders & preview
          </p>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'code' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Code Explorer
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'architecture' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Architecture & Flow
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'github' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub & CI/CD</span>
            </button>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export Project (.zip)</span>
          </button>
        </div>
      </div>

      {/* Quick Access Featured Files Bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mr-1 shrink-0">
          Core Files:
        </span>
        {[
          { label: 'Root App.tsx', path: 'App.tsx' },
          { label: 'ci.yml (CI/CD)', path: '.github/workflows/ci.yml' },
          { label: '.gitignore', path: '.gitignore' },
          { label: 'eas.json (Build)', path: 'eas.json' },
          { label: 'useImageResizer.ts', path: 'src/hooks/useImageResizer.ts' },
          { label: 'useFilePicker.ts', path: 'src/hooks/useFilePicker.ts' },
          { label: 'DimensionInput.tsx', path: 'src/components/DimensionInput.tsx' },
          { label: 'QualitySlider.tsx', path: 'src/components/QualitySlider.tsx' },
          { label: 'PreviewScreen.tsx', path: 'src/screens/PreviewScreen.tsx' },
        ].map((item) => {
          const isCurrent = selectedFile.path === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                const target = RN_PROJECT_FILES.find((f) => f.path === item.path);
                if (target) {
                  setSelectedFile(target);
                  setActiveTab('code');
                }
              }}
              className={`px-2.5 py-1 rounded-md shrink-0 font-medium transition-colors ${
                isCurrent && activeTab === 'code'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'code' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Left Sidebar */}
          <div className="w-64 bg-slate-950/60 border-r border-slate-800 flex flex-col overflow-y-auto p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
              Project Structure
            </div>

            <div className="space-y-3">
              {folderOrder.map((folderKey) => {
                const files = groupedFolders[folderKey];
                if (!files || files.length === 0) return null;

                const displayName =
                  folderKey === 'root'
                    ? 'Root Configuration'
                    : folderKey;

                return (
                  <div key={folderKey} className="space-y-0.5">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-300">
                      <Folder className="w-3.5 h-3.5 text-sky-400" />
                      <span>{displayName}</span>
                    </div>

                    <div className="pl-3 space-y-0.5 border-l border-slate-800/80 ml-3">
                      {files.map((file) => {
                        const isSelected = selectedFile.path === file.path;
                        return (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                              isSelected
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {getFileIcon(file)}
                              <span className="truncate">{file.filename}</span>
                            </div>
                            {isSelected && (
                              <ChevronRight className="w-3 h-3 text-sky-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Main Area */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File info bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/70 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile)}
                <span className="text-xs font-mono font-semibold text-white">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {selectedFile.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {selectedFile.description}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body with line numbers */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-[#0a0f1a]">
              <pre className="overflow-x-auto">
                <code>
                  {selectedFile.content.split('\n').map((line, idx) => (
                    <div key={idx} className="flex hover:bg-slate-800/40 px-1 rounded">
                      <span className="w-10 select-none text-slate-600 text-right pr-4 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="flex-1 whitespace-pre">{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      ) : activeTab === 'architecture' ? (
        /* Architecture & Engineering Guide View */
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-200 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Architecture Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-400" />
                <span>React Native Mobile Architecture for Image Resizing</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Mobile devices have strict memory limits. Decoding multi-megapixel raw photos
                directly into JavaScript buffers will crash the mobile app with an Out-Of-Memory (OOM) error.
                This project architecture delegates pixel scaling and compression to native C++/Metal/NDK pipelines
                using <code className="text-sky-300">expo-image-manipulator</code>, ensuring 60 FPS UI responsiveness
                and minimal RAM overhead.
              </p>
            </div>

            {/* Core Component Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">File Selection (<code className="text-sky-300">FilePicker.tsx</code>)</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Leverages <code className="text-slate-200">expo-image-picker</code> for iOS Photos and Android MediaStore access.
                  Automatically parses EXIF orientation flags so portrait photos taken with phone cameras
                  are not accidentally rotated sideways.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Dimension Controls (<code className="text-indigo-300">DimensionInput.tsx</code>)</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Maintains locked aspect ratio through instant mathematical proportionality (<code className="text-slate-200">width / height</code>).
                  Includes one-tap presets for Instagram (1080x1080, 1080x1920), YouTube thumbnails (1280x720), and standard HD/FHD resolutions.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-white">Quality Slider (<code className="text-amber-300">QualitySlider.tsx</code>)</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Binds to <code className="text-slate-200">@react-native-community/slider</code> with discrete 5% steps.
                  Maps 10%–100% directly to native JPEG/WebP quantization tables while automatically switching to lossless mode for PNG formats.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h4 className="text-sm font-bold text-white">Preview & Compare (<code className="text-emerald-300">PreviewScreen.tsx</code>)</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Features a gesture-driven PanResponder split comparison slider, live before/after dimension & file size stats, saving to photos with <code className="text-slate-200">expo-media-library</code>, and a prominent <strong>Share on WhatsApp</strong> button powered by <code className="text-emerald-300">expo-sharing</code> and native <code className="text-emerald-300">Linking</code>.
                </p>
              </div>
            </div>

            {/* Custom Hook Deep Dive: useImageResizer */}
            <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-sky-400" />
                  <h4 className="text-base font-bold text-white">
                    Custom Hook: <code className="text-sky-300">useImageResizer.ts</code>
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  expo-image-manipulator + expo-media-library
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-sky-400 mb-1">📐 Custom Dimensions & Quality</div>
                  <p className="text-slate-400 leading-relaxed">
                    Applies <code className="text-slate-300">ImageManipulator.manipulateAsync</code> with custom width, height, and normalized quality (0.1–1.0) while respecting aspect ratio.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">💾 Gallery Direct Export</div>
                  <p className="text-slate-400 leading-relaxed">
                    Uses <code className="text-slate-300">MediaLibrary.createAssetAsync</code> and <code className="text-slate-300">createAlbumAsync</code> with permission verification.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1">🧹 Cache & Memory Cleanup</div>
                  <p className="text-slate-400 leading-relaxed">
                    Tracks generated temp URIs in a ref; deletes old files via <code className="text-slate-300">FileSystem.deleteAsync</code> on re-runs and unmount to prevent cache leaks.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Run Instructions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>How to Run on Real Devices or Emulators</span>
              </h4>
              <div className="bg-slate-950 rounded-xl p-3 text-xs font-mono text-slate-300 space-y-2">
                <div className="text-slate-500"># 1. Unzip image-resizer-react-native.zip and enter directory</div>
                <div className="text-sky-300">cd image-resizer-rn && npm install</div>
                <div className="text-slate-500"># 2. Launch with Expo CLI</div>
                <div className="text-sky-300">npx expo start</div>
                <div className="text-slate-500"># 3. Press 'i' for iOS simulator, 'a' for Android, or scan QR code with Expo Go app!</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GitHub & CI/CD Pipeline Guide View */
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-200 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      GitHub Repository & Automated CI/CD Setup
                    </h3>
                    <p className="text-xs text-slate-400">
                      Everything required for a production-grade GitHub repository is pre-configured
                    </p>
                  </div>
                </div>
                <button
                  onClick={copyGitCommands}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {gitCmdsCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{gitCmdsCopied ? 'Commands Copied!' : 'Copy All Git Commands'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step GitHub Push Guide */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Step 1: Terminal Commands to Push to GitHub
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                1. GitHub.com par jakar ek naya repository create karein (jaise <code className="text-emerald-300">image-resizer-mobile</code>).
                <br />
                2. Apne computer ke terminal mein niche diye gaye commands run karein:
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 space-y-1.5 overflow-x-auto">
                <div className="text-slate-500"># Project folder mein git initialize karein</div>
                <div className="text-emerald-400">git init</div>
                <div className="text-slate-500 mt-2"># Saari files stage karein (.gitignore automatic unneeded files ko skip karega)</div>
                <div className="text-emerald-400">git add .</div>
                <div className="text-slate-500 mt-2"># Initial commit karein</div>
                <div className="text-emerald-400">git commit -m &quot;feat: initial commit for Image Resizer Mobile App&quot;</div>
                <div className="text-slate-500 mt-2"># Main branch set karein</div>
                <div className="text-emerald-400">git branch -M main</div>
                <div className="text-slate-500 mt-2"># Apne GitHub repository ka URL link karein</div>
                <div className="text-emerald-400">git remote add origin https://github.com/YOUR_USERNAME/image-resizer-mobile.git</div>
                <div className="text-slate-500 mt-2"># GitHub par code push karein</div>
                <div className="text-emerald-400">git push -u origin main</div>
              </div>
            </div>

            {/* What is Included Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* CI YAML */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      GitHub Actions (.yml)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span>.github/workflows/ci.yml</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automated Continuous Integration YAML file. Har bar jab aap GitHub par code push karenge, ye workflow:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Node.js 20 environment setup karta hai</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>TypeScript type check run karta hai (<code className="text-sky-300">tsc --noEmit</code>)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Expo project health check karta hai</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    const f = RN_PROJECT_FILES.find((x) => x.path === '.github/workflows/ci.yml');
                    if (f) {
                      setSelectedFile(f);
                      setActiveTab('code');
                    }
                  }}
                  className="mt-4 w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-orange-300 font-semibold rounded-lg transition-colors text-center"
                >
                  View ci.yml in Explorer →
                </button>
              </div>

              {/* .gitignore */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Git Ignore
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-rose-400" />
                    <span>.gitignore</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Essential security aur clean code practice rules:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span><code className="text-slate-200">node_modules/</code> GitHub par upload nahi hoga</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span><code className="text-slate-200">.expo/</code> cache aur build artifacts ignore honge</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>Local <code className="text-slate-200">.env</code> secrets safe rahenge</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    const f = RN_PROJECT_FILES.find((x) => x.path === '.gitignore');
                    if (f) {
                      setSelectedFile(f);
                      setActiveTab('code');
                    }
                  }}
                  className="mt-4 w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-rose-300 font-semibold rounded-lg transition-colors text-center"
                >
                  View .gitignore in Explorer →
                </button>
              </div>

              {/* eas.json */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Cloud Build Config
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-amber-400" />
                    <span>eas.json</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Expo Application Services (EAS) se direct Android APK ya Play Store bundle generate karne ke profiles:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">preview</strong>: Direct installable Android APK file generate karta hai</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">production</strong>: Play Store (.aab) aur iOS bundle ke liye ready</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    const f = RN_PROJECT_FILES.find((x) => x.path === 'eas.json');
                    if (f) {
                      setSelectedFile(f);
                      setActiveTab('code');
                    }
                  }}
                  className="mt-4 w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-semibold rounded-lg transition-colors text-center"
                >
                  View eas.json in Explorer →
                </button>
              </div>
            </div>

            {/* How to Build APK */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Bonus: GitHub se Android APK Build Kaise Banayein (EAS Build)</span>
              </h4>
              <p className="text-xs text-slate-300 mb-3">
                Apne phone me direct installable APK file download karne ke liye ye command chalayein:
              </p>
              <div className="bg-slate-950 rounded-xl p-3 text-xs font-mono text-slate-300 space-y-2">
                <div className="text-slate-500"># 1. Expo login karein (agar pehle se nahi hai)</div>
                <div className="text-emerald-300">npx eas-cli login</div>
                <div className="text-slate-500"># 2. Android APK build start karein (Cloud build - free tier available)</div>
                <div className="text-emerald-300">npx eas-cli build -p android --profile preview</div>
                <div className="text-slate-500"># Build complete hone par direct APK download link mil jayega!</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
