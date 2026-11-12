import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMimeTypeForFormat,
  getUTIForFormat,
  buildWhatsAppShareText,
  buildWhatsAppWebUrl,
} from './sharingLogic';

test('getMimeTypeForFormat returns correct image MIME types', () => {
  assert.equal(getMimeTypeForFormat('jpeg'), 'image/jpeg');
  assert.equal(getMimeTypeForFormat('jpg'), 'image/jpeg');
  assert.equal(getMimeTypeForFormat('png'), 'image/png');
  assert.equal(getMimeTypeForFormat('webp'), 'image/webp');
});

test('getUTIForFormat returns correct Apple Universal Type Identifiers', () => {
  assert.equal(getUTIForFormat('jpeg'), 'public.jpeg');
  assert.equal(getUTIForFormat('png'), 'public.png');
  assert.equal(getUTIForFormat('webp'), 'org.webmproject.webp');
});

test('buildWhatsAppShareText formats concise descriptive message', () => {
  const text = buildWhatsAppShareText({
    width: 1080,
    height: 1080,
    sizeFormatted: '180 KB',
    savingsPercentage: 78.4,
  });
  assert.equal(
    text,
    'Resized image: 1080x1080 px • 180 KB (78.4% size reduction) via Image Resizer Pro'
  );
});

test('buildWhatsAppWebUrl generates valid encoded URL', () => {
  const url = buildWhatsAppWebUrl('Test message');
  assert.equal(url, 'https://api.whatsapp.com/send?text=Test%20message');
});
