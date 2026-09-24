import { useColorScheme } from 'react-native';

import { usePreferencesStore } from '../store/preferencesStore';
import { darkPalette, lightPalette, radii, spacing, typography, type Palette } from './tokens';

export interface Theme {
  scheme: 'light' | 'dark';
  colors: Palette;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
}

export const useTheme = (): Theme => {
  const system = useColorScheme();
  const preference = usePreferencesStore((state) => state.theme);
  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  return {
    scheme,
    colors: scheme === 'dark' ? darkPalette : lightPalette,
    spacing,
    radii,
    typography,
  };
};
