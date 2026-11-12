import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTargetDimensions,
  calculateDimensionsFromScale,
  getAspectRatioLabel,
  formatBytes,
  calculateSavings,
} from './imageMath';

test('calculateTargetDimensions scales height when width changes with aspect ratio lock', () => {
  const original = { width: 1920, height: 1080 };
  const result = calculateTargetDimensions(original, 960, 1080, true, 'width');
  assert.equal(result.width, 960);
  assert.equal(result.height, 540);
});

test('calculateTargetDimensions scales width when height changes with aspect ratio lock', () => {
  const original = { width: 1920, height: 1080 };
  const result = calculateTargetDimensions(original, 1920, 540, true, 'height');
  assert.equal(result.width, 960);
  assert.equal(result.height, 540);
});

test('calculateTargetDimensions allows independent dimensions when aspect ratio lock is false', () => {
  const original = { width: 1920, height: 1080 };
  const result = calculateTargetDimensions(original, 800, 600, false, 'width');
  assert.equal(result.width, 800);
  assert.equal(result.height, 600);
});

test('calculateDimensionsFromScale reduces dimensions proportionally', () => {
  const original = { width: 1200, height: 800 };
  const result = calculateDimensionsFromScale(original, 50);
  assert.equal(result.width, 600);
  assert.equal(result.height, 400);
});

test('getAspectRatioLabel identifies common ratios', () => {
  assert.equal(getAspectRatioLabel(1920, 1080), '16:9');
  assert.equal(getAspectRatioLabel(1080, 1080), '1:1');
  assert.equal(getAspectRatioLabel(800, 600), '4:3');
});

test('formatBytes converts bytes to readable string', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(2.5 * 1024 * 1024), '2.5 MB');
});

test('calculateSavings determines compression reductions', () => {
  const result = calculateSavings(2000000, 500000);
  assert.equal(result.differenceBytes, 1500000);
  assert.equal(result.percentage, 75);
  assert.equal(result.isReduction, true);
});
