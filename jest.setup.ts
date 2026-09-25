/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Deterministic locale for formatting in tests (TZ is pinned in the npm script).
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageTag: 'en-MY' }],
}));

// FlashList needs native measurement, so tests use FlatList's matching props contract.
jest.mock('@shopify/flash-list', () => ({
  FlashList: require('react-native').FlatList,
}));
