# ADR 005: Device privacy controls

## Status

Accepted

## Context

Transaction history contains financial and personally identifiable information. The application must reduce accidental disclosure when a device is shared, captured, recorded, or visible in the operating-system task switcher. These client controls supplement backend authorization; they do not replace it.

## Decision

- Require native device authentication when biometric hardware is available and enrolled.
- Permit the application to run on unsupported or unenrolled devices so the assessment remains testable across simulators and development environments.
- Re-lock after the application enters the background and authenticate again when it becomes active.
- Request strong biometrics on Android while retaining the operating system's device-credential fallback.
- Block screenshots and recordings while the application is mounted.
- Apply maximum app-switcher blur on iOS. Android receives task-preview protection through its secure-window flag.
- Keep native authentication behind an interface. The application receives only a success or failure result and never handles biometric data.
- Keep logs free from transaction payloads, names, references, and amounts.

## Consequences

Authentication behavior can be tested without invoking native prompts. Users can recover from cancellation, lockout, and transient native failures through an explicit retry. Screen-capture behavior requires a physical device or emulator for final verification because JavaScript tests can verify only the native API boundary.
