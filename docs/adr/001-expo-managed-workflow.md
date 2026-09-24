# ADR-001: Expo with Continuous Native Generation

- Status: Accepted
- Date: 2026-09-24

## Context

Reviewers need to run the app quickly on different development machines. The app also needs native capabilities including biometrics, screen-capture protection, file sharing, and view snapshots.

## Decision

Use Expo SDK 57 with Expo Router and Continuous Native Generation. Configure native behavior through `app.json` and config plugins; generate `ios/` and `android/` rather than editing them manually.

## Consequences

- `npx expo start` supports rapid review through Expo Go.
- `npx expo run:ios` or `npx expo run:android` provides the full native build required for Face ID and Maestro.
- Expo SDK upgrades coordinate native dependency upgrades, with `expo-doctor` validating alignment in CI.
- A custom native module would require a config plugin or local Expo module.

## Alternatives considered

- **Bare React Native CLI** provides full native control but adds setup and review overhead without a benefit for this scope.
