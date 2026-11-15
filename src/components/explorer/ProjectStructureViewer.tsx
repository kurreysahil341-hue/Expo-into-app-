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

  const handleDownloadSingleFile = (file: RNFileDefinition) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    downloadProjectZip(blob, file.filename);
  };

  const getFileIcon = (file: RNFileDefinition) => {
    if (file.filename.endsWith('.yml') || file.filename.endsWith('.yaml')) {
      return <FileText className="w-4 h-4 text-orange-400 shrink-0" />;
    }
    if (file.filename.endsWith('.gradle') || file.filename.endsWith('.properties') || file.filename.endsWith('.pro')) {
      return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (file.filename.endsWith('.kt') || file.filename.endsWith('.xml')) {
      return <FileCode className="w-4 h-4 text-teal-400 shrink-0" />;
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
    'github-actions',
    'android',
    'android/app',
    'android/gradle/wrapper',
    'android/app/src/main',
    'android/app/src/debug',
    'android/app/src/main/res/values',
    'android/app/src/main/res/xml',
    'android/app/src/main/res/drawable',
    'android/app/src/main/java/com/imageresizerpro',
    'scripts',
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
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              RN CLI 0.74+ (No Expo)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            GitHub Actions ready React Native project with automated Android APK builds
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
          { label: 'android-apk.yml (YAML)', path: '.github/workflows/android-apk.yml' },
          { label: 'android/app/build.gradle', path: 'android/app/build.gradle' },
          { label: 'AndroidManifest.xml', path: 'android/app/src/main/AndroidManifest.xml' },
          { label: 'MainActivity.kt', path: 'android/app/src/main/java/com/imageresizerpro/MainActivity.kt' },
          { label: 'package.json', path: 'package.json' },
          { label: 'useImageResizer.ts', path: 'src/hooks/useImageResizer.ts' },
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
                  onClick={() => handleDownloadSingleFile(selectedFile)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-medium rounded-md border border-sky-500/30 transition-colors cursor-pointer"
                  title="Download this file directly"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
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
                <span>Pure React Native CLI Architecture (Zero Expo)</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Mobile devices have strict memory limits. Decoding multi-megapixel raw photos
                directly into JavaScript buffers will crash the mobile app with an Out-Of-Memory (OOM) error.
                This project architecture delegates pixel scaling and compression to native C++/Metal/NDK pipelines
                using <code className="text-sky-300">@bam.tech/react-native-image-resizer</code>, ensuring 60 FPS UI responsiveness
                and minimal RAM overhead — built directly via Gradle &amp; GitHub Actions.
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
                  Leverages <code className="text-slate-200">react-native-image-picker</code> for native iOS Photos and Android MediaStore access.
                  Automatically handles Android runtime <code className="text-slate-200">PermissionsAndroid</code> checks and EXIF orientation flags.
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
                  Maps 10%–100% directly to native JPEG/WebP compression while keeping PNG lossless.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h4 className="text-sm font-bold text-white">Preview &amp; Compare (<code className="text-emerald-300">PreviewScreen.tsx</code>)</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Features a gesture-driven PanResponder split comparison slider, live before/after dimension &amp; file size stats, saving to photos with <code className="text-slate-200">@react-native-camera-roll/camera-roll</code>, and a prominent <strong>Share on WhatsApp</strong> button powered by <code className="text-emerald-300">react-native-share</code> (<code className="text-emerald-300">Social.Whatsapp</code>) and <code className="text-emerald-300">Linking</code>.
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
                  ImageResizer + CameraRoll + RNFS
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-sky-400 mb-1">📐 Custom Dimensions &amp; Quality</div>
                  <p className="text-slate-400 leading-relaxed">
                    Calls <code className="text-slate-300">ImageResizer.createResizedImage</code> with custom width, height, and quality (10–100) while respecting aspect ratio.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">💾 Gallery Direct Export</div>
                  <p className="text-slate-400 leading-relaxed">
                    Uses <code className="text-slate-300">CameraRoll.saveAsset</code> with Android 13+ (<code className="text-slate-300">READ_MEDIA_IMAGES</code>) permission checks.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1">🧹 Cache &amp; Memory Cleanup</div>
                  <p className="text-slate-400 leading-relaxed">
                    Tracks generated temp URIs in a ref; deletes old files via <code className="text-slate-300">RNFS.unlink</code> on re-runs and unmount to prevent cache leaks.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Run Instructions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>How to Run Locally (React Native CLI — No Expo)</span>
              </h4>
              <div className="bg-slate-950 rounded-xl p-3 text-xs font-mono text-slate-300 space-y-2">
                <div className="text-slate-500"># 1. Unzip project and install dependencies</div>
                <div className="text-sky-300">cd image-resizer-rn &amp;&amp; npm install</div>
                <div className="text-slate-500"># 2. Generate native android/ios folders &amp; apply permissions</div>
                <div className="text-sky-300">npx @react-native-community/cli@latest init TempRN --version 0.74.5 --skip-install --skip-git-init &amp;&amp; cp -r TempRN/android ./android &amp;&amp; rm -rf TempRN &amp;&amp; node scripts/configure-android.js</div>
                <div className="text-slate-500"># 3. Build APK or run on Android Emulator / Device</div>
                <div className="text-sky-300">npm run android</div>
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
                      GitHub Direct Android APK Builder (Zero Expo)
                    </h3>
                    <p className="text-xs text-slate-400">
                      GitHub par push karte hi GitHub Actions cloud runner apne aap Android APK compile karega
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
                  Step 1: GitHub Par Code Push Karein (APK Automatic Banega)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                1. GitHub.com par naya repository banayein (jaise <code className="text-emerald-300">image-resizer-mobile</code>).
                <br />
                2. Export ki gayi ZIP extract karein aur dhyaan rakhein ki <code className="text-amber-300">.github/workflows/android-apk.yml</code> repo ke <strong>bilkul root</strong> par ho (kisi subfolder ke andar nahi!). Terminal mein folder ke andar jaakar ye commands run karein:
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 space-y-1.5 overflow-x-auto">
                <div className="text-slate-500"># Project folder mein git initialize karein</div>
                <div className="text-emerald-400">git init</div>
                <div className="text-slate-500 mt-2"># Saari files stage karein (.gitignore unnecessary build files ko skip karega)</div>
                <div className="text-emerald-400">git add .</div>
                <div className="text-slate-500 mt-2"># Initial commit karein</div>
                <div className="text-emerald-400">git commit -m &quot;feat: initial commit for Image Resizer Mobile App&quot;</div>
                <div className="text-slate-500 mt-2"># Main branch set karein</div>
                <div className="text-emerald-400">git branch -M main</div>
                <div className="text-slate-500 mt-2"># Apne GitHub repository ka URL link karein</div>
                <div className="text-emerald-400">git remote add origin https://github.com/YOUR_USERNAME/image-resizer-mobile.git</div>
                <div className="text-slate-500 mt-2"># GitHub par push karein — GitHub Actions automatic APK build start kar dega!</div>
                <div className="text-emerald-400">git push -u origin main</div>
              </div>
            </div>

            {/* What is Included Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Android APK Workflow YAML */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      GitHub Actions (.yml)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span>android-apk.yml</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bina Expo aur bina Android Studio ke direct GitHub cloud par APK compile karta hai:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Node 20, Java JDK 17, Android SDK &amp; Gradle 8.6 setup</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>TypeScript check (<code className="text-sky-300">tsc --noEmit</code>)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Debug &amp; Release APK compile + GitHub Release upload</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      const f = RN_PROJECT_FILES.find((x) => x.path === '.github/workflows/android-apk.yml');
                      if (f) {
                        setSelectedFile(f);
                        setActiveTab('code');
                      }
                    }}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-xs text-orange-300 font-semibold rounded-lg transition-colors text-center"
                  >
                    View YAML →
                  </button>
                  <button
                    onClick={() => {
                      const f = RN_PROJECT_FILES.find((x) => x.path === '.github/workflows/android-apk.yml');
                      if (f) handleDownloadSingleFile(f);
                    }}
                    className="py-1.5 px-2.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-xs text-orange-300 font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Android Native Gradle & Kotlin Files */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Android Native Files
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    <span>android/ Gradle &amp; Kotlin</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    APK compile karne ke liye sabhi Android native files included hain:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span><code className="text-slate-200">build.gradle</code>, <code className="text-slate-200">settings.gradle</code> &amp; <code className="text-slate-200">gradle.properties</code></span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span><code className="text-slate-200">AndroidManifest.xml</code> (Camera, Media &amp; WhatsApp)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span><code className="text-slate-200">MainActivity.kt</code> &amp; <code className="text-slate-200">MainApplication.kt</code></span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    const f = RN_PROJECT_FILES.find((x) => x.path === 'android/app/build.gradle');
                    if (f) {
                      setSelectedFile(f);
                      setActiveTab('code');
                    }
                  }}
                  className="mt-4 w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 font-semibold rounded-lg transition-colors text-center"
                >
                  View android/app/build.gradle →
                </button>
              </div>

              {/* .gitignore & Entry */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      RN CLI Config
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-rose-400" />
                    <span>.gitignore + index.js</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Standard React Native CLI project root setup:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span><code className="text-slate-200">index.js</code>, <code className="text-slate-200">babel.config.js</code> &amp; <code className="text-slate-200">metro.config.js</code></span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span><code className="text-slate-200">node_modules/</code>, Gradle cache &amp; <code className="text-slate-200">*.keystore</code> ignored</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>100% Expo-free native dependencies</span>
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
                  View .gitignore →
                </button>
              </div>
            </div>

            {/* How to Download APK from GitHub */}
            <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Step 2: GitHub Se Built APK Kaise Download Karein</span>
              </h4>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                <li>
                  GitHub par apni repository open karein aur upar <strong className="text-white">Actions</strong> tab par click karein.
                </li>
                <li>
                  <strong className="text-emerald-300">Build Android APK (GitHub Actions)</strong> workflow complete hone dein (✅ Green tick aane tak wait karein).
                </li>
                <li>
                  Workflow run ke andar niche <strong className="text-white">Artifacts → ImageResizerPro-Release-APK</strong> (ya <strong className="text-white">ImageResizerPro-Debug-APK</strong>) par click karke direct <code className="text-emerald-300">.apk</code> download karein — ya <strong className="text-white">Releases</strong> section se install karein!
                </li>
                <li>
                  <strong className="text-amber-300">Important Tip (Hidden `.github` folder):</strong> Phone / Mac / Linux file manager mein dot-folders (<code className="text-amber-300">.github</code>) default roop se hidden hote hain — isliye ZIP me ek visible copy <code className="text-sky-300">github-actions/android-apk.yml</code> bhi di gayi hai, aur aap upar <strong>Download</strong> button se bhi seedhe <code className="text-orange-300">android-apk.yml</code> download karke GitHub par <strong>Add file → Create new file → <code>.github/workflows/android-apk.yml</code></strong> me paste kar sakte hain!
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
