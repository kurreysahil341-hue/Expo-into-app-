import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleImageSelectedTransition,
  handleResizeCompletedTransition,
  handleResetTransition,
  canNavigateTo,
} from './navigationState';

test('handleImageSelectedTransition moves from home to resize screen', () => {
  const initial = { currentScreen: 'home' as const, selectedImage: null, resizedResult: null };
  const mockImage = { uri: 'file://sample.jpg', width: 1000, height: 800 };
  const next = handleImageSelectedTransition(initial, mockImage);

  assert.equal(next.currentScreen, 'resize');
  assert.deepEqual(next.selectedImage, mockImage);
  assert.equal(next.resizedResult, null);
});

test('handleResizeCompletedTransition moves from resize to preview screen', () => {
  const mockImage = { uri: 'file://sample.jpg', width: 1000, height: 800 };
  const current = { currentScreen: 'resize' as const, selectedImage: mockImage, resizedResult: null };
  const mockResult = { uri: 'file://resized.jpg', width: 500, height: 400 };
  const next = handleResizeCompletedTransition(current, mockResult);

  assert.equal(next.currentScreen, 'preview');
  assert.deepEqual(next.resizedResult, mockResult);
});

test('handleResetTransition resets all image and result state and returns to home', () => {
  const next = handleResetTransition();
  assert.equal(next.currentScreen, 'home');
  assert.equal(next.selectedImage, null);
  assert.equal(next.resizedResult, null);
});

test('canNavigateTo guards screens when preconditions are not met', () => {
  assert.equal(canNavigateTo('home', false, false), true);
  assert.equal(canNavigateTo('resize', false, false), false);
  assert.equal(canNavigateTo('resize', true, false), true);
  assert.equal(canNavigateTo('preview', true, false), false);
  assert.equal(canNavigateTo('preview', true, true), true);
});
