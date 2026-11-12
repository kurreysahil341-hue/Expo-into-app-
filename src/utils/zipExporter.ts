import JSZip from 'jszip';
import { RN_PROJECT_FILES } from '../data/rnProjectFiles';

export async function exportReactNativeProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const rootFolder = zip.folder('image-resizer-rn') || zip;

  for (const file of RN_PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  // Generate binary zip
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return content;
}

export function downloadProjectZip(blob: Blob, filename = 'image-resizer-rn-project.zip'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
