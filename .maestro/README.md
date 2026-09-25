# Maestro end-to-end tests

These flows exercise the installed development or release build through the native accessibility tree. They do not run inside Jest and require a booted Android emulator or iOS simulator.

## Prerequisites

1. Install the Maestro CLI using the official installation instructions.
2. Start a simulator or emulator.
3. Install an application build with package or bundle identifier `com.vihangayohan.aeontransactions`.
4. The flows sign in using the demo username and password; biometric enrollment is not required.

## Run

```bash
npm run test:e2e
```

Run only the critical smoke journeys:

```bash
maestro test .maestro --include-tags smoke
```

Each flow clears application state and can run independently. Visible assertions cover user-facing copy, while stable identifiers are used for interaction targets so text changes do not make navigation tests brittle.
