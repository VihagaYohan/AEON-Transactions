# ADR 006: Bounded offline transaction cache

## Status

Accepted

## Context

Users may temporarily lose connectivity after successfully loading their transaction history. A blank error screen would discard useful, already validated information, but silently displaying old financial data could mislead them.

## Decision

- Decorate the active repository with an offline cache instead of coupling persistence to screens or query hooks.
- Persist only transactions that have passed runtime API validation and domain mapping.
- Fall back only for network failures. Data-contract failures remain visible and are never concealed by cached responses.
- Validate and version cached data before use.
- Expire cached transaction history after 24 hours and remove invalid or expired entries.
- Display an accessible banner with the cache timestamp whenever saved data is shown.
- Remove the banner immediately after a successful network refresh.
- Treat storage writes as best effort so storage failure cannot invalidate a successful network response.

## Consequences

The application remains useful during short outages while clearly communicating that the information may be stale. AsyncStorage is application-sandbox storage, not an encrypted secrets vault; therefore the cache has a short lifetime, Android backup is disabled, and authentication plus screen-capture controls continue to guard presentation. A production rollout must confirm retention and at-rest storage requirements with the bank's security policy.
