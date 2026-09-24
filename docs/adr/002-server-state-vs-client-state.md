# ADR-002: TanStack Query for server state, Zustand for client state

- Status: Accepted
- Date: 2026-09-24

## Context

Transactions come from a backend and require loading, error, retry, refresh, and cache behavior. Preferences and lock status belong to the client. Keeping both categories in one store leads to handwritten caching and unnecessary subscriptions.

## Decision

- TanStack Query owns transactions, including list and detail caches.
- Zustand owns client preferences and security state.
- Components subscribe to Zustand through selectors.
- Detail queries are seeded from list data so navigation feels immediate.

## Consequences

- Transaction data is not duplicated in Zustand.
- The retry policy is centralized: transient failures retry twice and contract failures do not retry.
- The project uses two focused state libraries instead of one general-purpose store.

## Alternatives considered

- **Zustand only** would require custom loading, error, retry, and cache behavior.
- **Redux Toolkit with RTK Query** is capable but heavier than this application requires.
