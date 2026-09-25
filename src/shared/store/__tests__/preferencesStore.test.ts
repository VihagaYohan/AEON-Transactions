import { initialPreferences, usePreferencesStore } from '../preferencesStore';

describe('preferencesStore', () => {
  beforeEach(() => usePreferencesStore.setState(initialPreferences));

  it('toggles hidden amounts', () => {
    usePreferencesStore.getState().toggleHideAmounts();
    expect(usePreferencesStore.getState().hideAmounts).toBe(true);

    usePreferencesStore.getState().toggleHideAmounts();
    expect(usePreferencesStore.getState().hideAmounts).toBe(false);
  });

  it('sets the theme override', () => {
    usePreferencesStore.getState().setTheme('dark');

    expect(usePreferencesStore.getState().theme).toBe('dark');
  });

  it('persists only preference fields with a version for migrations', () => {
    const options = usePreferencesStore.persist.getOptions();

    expect(options.name).toBe('preferences');
    expect(options.version).toBe(1);
    expect(options.partialize?.(usePreferencesStore.getState())).toEqual(initialPreferences);
  });
});
