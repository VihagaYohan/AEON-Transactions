import { getLocales } from 'expo-localization';

export const FALLBACK_LOCALE = 'en-MY';

/** Device locale (e.g. "en-MY"), falling back to Malaysian English. */
export const getDeviceLocale = (): string => getLocales()[0]?.languageTag ?? FALLBACK_LOCALE;
