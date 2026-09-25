# ADR-004: Feature-based Clean Architecture

- Status: Accepted
- Date: 2026-09-24

## Context

A small brief still benefits from boundaries that allow the data source to change and keep business rules testable without React.

## Decision

- Use `src/features/<feature>/{domain,data,hooks,components,screens}` with a public `index.ts`.
- Keep the domain as pure TypeScript with no React or Expo imports.
- Use Zod schemas, DTO-to-entity mapping, and an injected `TransactionRepository` in the data layer.
- Keep route files in `src/app` thin so screens can be tested without a router.
- Use ESLint import restrictions to prevent deep imports across features.

## Consequences

- Swapping the mock for a real API changes one composition point in `_layout.tsx`.
- The feature boundary introduces slightly more files than a flat structure.
