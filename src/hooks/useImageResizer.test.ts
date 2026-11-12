import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeQuality,
  buildManipulatorActions,
  getExtensionForFormat,
} from '../utils/resizerLogic';

test('normalizeQuality converts percentage (10-100) to factor (0.1-1.0)', () => {
  assert.equal(normalizeQuality(80), 0.8);
  assert.equal(normalizeQuality(50), 0.5);
  assert.equal(normalizeQuality(100), 1.0);
  assert.equal(normalizeQuality(10), 0.1);
});

test('normalizeQuality keeps decimal inputs within valid bounds', () => {
  assert.equal(normalizeQuality(0.75), 0.75);
  assert.equal(normalizeQuality(0.05), 0.1); // clamped to min 0.1
  assert.equal(normalizeQuality(1.0), 1.0);
});

test('normalizeQuality defaults safely on undefined or NaN', () => {
  assert.equal(normalizeQuality(undefined), 0.8);
  assert.equal(normalizeQuality(NaN), 0.8);
});

test('buildManipulatorActions creates resize actions preserving aspect ratio', () => {
  const actionsOnlyWidth = buildManipulatorActions({ width: 800, maintainAspectRatio: true });
  assert.deepEqual(actionsOnlyWidth, [{ resize: { width: 800 } }]);

  const actionsBoth = buildManipulatorActions({ width: 800, height: 600, maintainAspectRatio: false });
  assert.deepEqual(actionsBoth, [{ resize: { width: 800, height: 600 } }]);
});

test('getExtensionForFormat returns correct extensions', () => {
  assert.equal(getExtensionForFormat('jpeg'), 'jpg');
  assert.equal(getExtensionForFormat('png'), 'png');
  assert.equal(getExtensionForFormat('webp'), 'webp');
});
