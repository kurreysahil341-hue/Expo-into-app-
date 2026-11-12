/**
 * WhatsApp and social sharing helpers for Image Resizer
 */

export function getMimeTypeForFormat(format: string): string {
  const normalized = (format || 'jpeg').toLowerCase();
  switch (normalized) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpeg':
    case 'jpg':
    default:
      return 'image/jpeg';
  }
}

export function getUTIForFormat(format: string): string {
  const normalized = (format || 'jpeg').toLowerCase();
  switch (normalized) {
    case 'png':
      return 'public.png';
    case 'webp':
      return 'org.webmproject.webp';
    case 'jpeg':
    case 'jpg':
    default:
      return 'public.jpeg';
  }
}

export function buildWhatsAppShareText(options: {
  width: number;
  height: number;
  sizeFormatted: string;
  savingsPercentage?: number;
}): string {
  const { width, height, sizeFormatted, savingsPercentage } = options;
  const savingsPart =
    savingsPercentage && savingsPercentage > 0
      ? ` (${savingsPercentage}% size reduction)`
      : '';
  return `Resized image: ${width}x${height} px • ${sizeFormatted}${savingsPart} via Image Resizer Pro`;
}

export function buildWhatsAppWebUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
