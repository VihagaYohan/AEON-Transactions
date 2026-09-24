import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

interface PreferencesState {
  hideAmounts: boolean;
  theme: ThemePreference;
  toggleHideAmounts: () => void;
  setTheme: (theme: ThemePreference) => void;
}

export const initialPreferences = {
  hideAmounts: false,
  theme: 'system' as ThemePreference,
};

/** Client-only UI preferences. This store never contains server data or secrets. */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initialPreferences,
      toggleHideAmounts: () => set((state) => ({ hideAmounts: !state.hideAmounts })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'preferences',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hideAmounts, theme }) => ({ hideAmounts, theme }),
    },
  ),
);
