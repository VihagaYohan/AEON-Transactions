/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Deterministic locale for formatting in tests (TZ is pinned in the npm script).
jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageTag: "en-MY" }],
}));
