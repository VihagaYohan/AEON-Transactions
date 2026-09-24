import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { usePreferencesStore } from '@/shared/store/preferencesStore';

import { darkPalette, lightPalette } from '../tokens';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  beforeEach(() => usePreferencesStore.setState({ theme: 'system', hideAmounts: false }));
  afterEach(() => jest.restoreAllMocks());

  it('follows the system color scheme by default', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    const { result } = await renderHook(() => useTheme());

    expect(result.current.scheme).toBe('dark');
    expect(result.current.colors).toBe(darkPalette);
  });

  it('follows a light system color scheme', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');

    const { result } = await renderHook(() => useTheme());

    expect(result.current.scheme).toBe('light');
    expect(result.current.colors).toBe(lightPalette);
  });

  it('uses an explicit preference instead of the system scheme', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
    usePreferencesStore.setState({ theme: 'dark' });

    const { result } = await renderHook(() => useTheme());

    expect(result.current.scheme).toBe('dark');
  });
});
