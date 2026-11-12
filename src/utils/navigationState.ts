/**
 * Navigation state helper and transitions for React Native Image Resizer app
 */

export type NavigationScreen = 'home' | 'resize' | 'preview';

export interface AppNavigationState<TImage, TResult> {
  currentScreen: NavigationScreen;
  selectedImage: TImage | null;
  resizedResult: TResult | null;
}

export function handleImageSelectedTransition<TImage, TResult>(
  prevState: AppNavigationState<TImage, TResult>,
  newImage: TImage
): AppNavigationState<TImage, TResult> {
  return {
    ...prevState,
    currentScreen: 'resize',
    selectedImage: newImage,
    resizedResult: null,
  };
}

export function handleResizeCompletedTransition<TImage, TResult>(
  prevState: AppNavigationState<TImage, TResult>,
  newResult: TResult
): AppNavigationState<TImage, TResult> {
  return {
    ...prevState,
    currentScreen: 'preview',
    resizedResult: newResult,
  };
}

export function handleResetTransition<TImage, TResult>(): AppNavigationState<TImage, TResult> {
  return {
    currentScreen: 'home',
    selectedImage: null,
    resizedResult: null,
  };
}

export function canNavigateTo(
  target: NavigationScreen,
  hasImage: boolean,
  hasResult: boolean
): boolean {
  if (target === 'home') return true;
  if (target === 'resize') return hasImage;
  if (target === 'preview') return hasResult;
  return false;
}
