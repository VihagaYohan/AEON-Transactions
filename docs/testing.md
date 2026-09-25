# Testing guide

## Automated checks

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test:ci
npm run doctor
```

`test:ci` runs Jest serially to avoid React Native renderer contention on small CI runners and writes the HTML report to `coverage/`.

| Layer                    | Evidence                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Domain unit tests        | Direction, sorting, grouping, summaries, money, formatting, accessible descriptions |
| Data unit tests          | Schemas, mapping, HTTP failures, mock behavior, repositories, offline cache         |
| Component tests          | Shared primitives, amount privacy, transaction interaction                          |
| Screen integration tests | Loading, error, retry, empty, list, detail, copy, sharing, offline state            |
| Native-boundary tests    | Biometrics, capture protection, receipt capture, URI handling, cleanup              |
| End-to-end tests         | Installed-app list, navigation, detail, copy, and privacy journeys                  |

## Maestro

Maestro requires an installed native app and a running emulator or simulator.

```bash
npm run android
npm run test:e2e
```

On macOS, install with `npm run ios`. Use an emulator without enrolled biometrics for deterministic automation, or complete the native prompt manually.

```bash
maestro test .maestro --include-tags smoke
```

## Core manual journey

1. Launch and authenticate when prompted.
2. Confirm newest-first transactions, month headings, and cash-flow totals.
3. Pull to refresh and open an incoming transaction.
4. Verify amount, sender, date, description, and reference.
5. Copy the reference and confirm the persistent success label.
6. Inspect the text share sheet and PNG receipt share sheet.
7. Hide amounts and confirm every value is masked and both share actions are disabled.
8. Background and restore the app; authentication should run again when enrolled.
9. Check light mode, dark mode, large text, and screen-reader output.

## Offline scenario

Load transactions successfully once, then restart Metro with forced failures:

```bash
EXPO_PUBLIC_MOCK_FAIL_RATE=1 npm run start -- --clear
```

Reload the app. Saved transactions and an `Offline` banner should appear. Restart without the failure flag and pull to refresh; the banner should disappear. Clear application storage before forced failure to verify the first-load error state.

## Native privacy checks

1. Attempt screenshots and screen recordings on both platforms.
2. Confirm content is obscured in the app switcher.
3. Cancel authentication and verify the locked retry screen.
4. Verify successful authentication and background re-locking.
5. Cancel receipt sharing and retry.

These checks require a physical device or emulator. Face ID requires a development or release build rather than Expo Go.
