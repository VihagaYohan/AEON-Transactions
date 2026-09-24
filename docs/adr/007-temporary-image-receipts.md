# ADR 007: Temporary image receipts

## Status

Accepted

## Context

Users need a portable transaction receipt that preserves a consistent visual layout. Text sharing remains useful for accessibility and messaging, while an image can be saved, printed, or shared through the operating system without introducing a PDF-generation dependency.

## Decision

- Render a dedicated receipt view from the same validated transaction entity used by the detail screen.
- Capture that native view as a lossless PNG in the operating system's temporary directory.
- Check native sharing availability before creating the image.
- Share through the platform sheet with explicit PNG metadata.
- Release the temporary capture after success, cancellation, or sharing failure.
- Keep text sharing as a separate action.
- Disable both sharing actions while amounts are hidden so privacy mode cannot leak monetary values.
- Surface capture or sharing failures as a recoverable inline message without exposing native error details.

## Consequences

The receipt works across iOS and Android and leaves no application-managed permanent copy. View capture and the native share sheet require device-level manual verification; unit tests cover URI normalization, unsupported platforms, cleanup, and failure behavior at the native boundary.
