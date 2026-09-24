# AEON Transactions

A production-minded Expo and React Native transaction-history application built for the AEON Bank Mobile Engineer assessment.

The app loads a validated transaction feed, groups it by month, calculates exact cash-flow totals, and provides accessible transaction details. It also includes biometric re-authentication, screen-capture protection, bounded offline access, amount privacy, and shareable text and image receipts.

## Feature overview

- Transaction history sorted newest first and grouped by month
- Exact money-in and money-out summaries using integer sen
- Pull-to-refresh plus loading, empty, error, retry, and offline states
- Detail screens with sender or recipient, date, reference, and signed amount
- Copyable references plus native text and PNG receipt sharing
- Persistent hide-amounts preference and light/dark themes
- Biometric unlock, background re-authentication, and screen privacy
- Validated 24-hour offline cache with visible stale-data status
- Unit, integration, native-boundary, and Maestro end-to-end coverage

## Technology

| Area       | Choice                                         |
| ---------- | ---------------------------------------------- |
| Runtime    | Expo SDK 57, React Native 0.86, React 19       |
| Language   | Strict TypeScript                              |
| Navigation | Expo Router                                    |
| State      | TanStack Query and Zustand                     |
| Validation | Zod                                            |
| Lists      | Shopify FlashList                              |
| Testing    | Jest, React Native Testing Library, Maestro    |
| Automation | GitHub Actions, Husky, lint-staged, commitlint |

## Requirements and setup

- Node.js 22 or newer and npm
- Android Studio for Android native builds
- macOS with Xcode for iOS native builds
- Maestro CLI for end-to-end tests

```bash
git clone <repository-url>
cd AEON-Transactions
npm ci
cp .env.example .env.local
npm run android
```

Use `npm run start` with Expo Go or an existing development build. On macOS, use `npm run ios` for the iOS Simulator. Native builds are recommended for biometrics, screen privacy, receipt capture, and Maestro. The `ios/` and `android/` directories use Expo Continuous Native Generation and must not be edited manually.

## Runtime configuration

Only non-secret mock controls use `EXPO_PUBLIC_*` variables. Expo embeds them in the application bundle, so they must never contain credentials.

| Variable                      | Default | Purpose                                  |
| ----------------------------- | ------: | ---------------------------------------- |
| `EXPO_PUBLIC_MOCK_LATENCY_MS` |   `600` | Simulated latency in milliseconds        |
| `EXPO_PUBLIC_MOCK_FAIL_RATE`  |     `0` | Failure probability from `0` through `1` |

Force the error path from Git Bash:

```bash
EXPO_PUBLIC_MOCK_FAIL_RATE=1 npm run start -- --clear
```

## Architecture

```text
src/
├── app/                         Expo Router composition and routes
├── config/                      Environment and query configuration
├── features/transactions/
│   ├── domain/                  Pure entities and business rules
│   ├── data/                    Schemas, mapping, repositories, offline cache
│   ├── hooks/                   TanStack Query integration
│   ├── components/              Reusable transaction UI
│   ├── screens/                 Route-independent screens
│   └── services/                Receipt capture and native sharing
├── shared/                      Libraries, security, stores, theme, and UI
└── test/                        Factories and provider-aware render helpers
```

```text
API or fixture → Zod validation → DTO mapping → domain transaction
               → offline repository → TanStack Query → screen
```

Routes remain thin. Screens receive navigation and native effects through props, repositories are injected through context, and domain logic has no React or Expo dependency.

## Domain assumptions

- The API has no currency field, so values are Malaysian ringgit (`MYR`).
- Positive amounts are incoming; negative amounts are outgoing.
- API decimals become integer sen at the data boundary.
- UTC ISO-8601 timestamps display in the device locale and time zone.
- `recipientName` is the counterparty: `From` for incoming and `To` for outgoing.
- Reference IDs contain 1–20 uppercase alphanumeric characters.
- Offline data expires after 24 hours and is used only for network failures.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test:ci
npm run format:check
npm run doctor
```

`npm run validate` runs the local lint, type, and test checks. At handoff, the suite contains 23 test suites and 113 tests with coverage above every configured threshold. CI also runs dependency auditing and secret scanning.

See [Testing](docs/testing.md) for manual scenarios, offline verification, Maestro, and native security checks.

## Accessibility and performance

- Semantic roles, labels, hints, and minimum touch targets
- Screen-reader descriptions that do not rely on color
- Dynamic type without fixed text heights and contrast-aware themes
- FlashList virtualization with stable keys and item types
- Cached formatters and shared list/detail query data
- React Compiler rather than manual component memoization

## Security boundary

The app never receives or stores biometric material. Logs exclude transaction payloads and personally identifiable information. Android backup is disabled, temporary receipt files are released, sharing is disabled when amounts are hidden, and cached data has a bounded lifetime.

These controls do not replace backend authentication, authorization, TLS, secure token storage, fraud controls, or the bank's retention policy. AsyncStorage is sandboxed but not an encrypted secrets vault; production offline storage requires explicit security and compliance approval.

## Architecture decisions

- [ADR 001: Expo and CNG](docs/adr/001-expo-managed-workflow.md)
- [ADR 002: Server and client state](docs/adr/002-server-state-vs-client-state.md)
- [ADR 003: Money in minor units](docs/adr/003-money-in-minor-units.md)
- [ADR 004: Feature-based architecture](docs/adr/004-feature-based-clean-architecture.md)
- [ADR 005: Device privacy](docs/adr/005-device-privacy-controls.md)
- [ADR 006: Offline cache](docs/adr/006-bounded-offline-cache.md)
- [ADR 007: Image receipts](docs/adr/007-temporary-image-receipts.md)

## Production follow-ups

- Replace the mock repository with the HTTP repository at the root composition point.
- Integrate bank identity, token refresh, authorization, and certificate-pinning requirements.
- Approve offline retention or adopt an approved encrypted store.
- Add redacted production telemetry and signed EAS release profiles.
- Complete the physical-device and assistive-technology certification matrix.

See the [assessment checklist](docs/assessment-checklist.md) for requirement traceability.
