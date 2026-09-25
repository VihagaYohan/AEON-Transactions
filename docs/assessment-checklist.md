# Assessment implementation checklist

This maps delivered behavior to implementation and test evidence.

## Transaction history

- [x] Load the supplied response through a repository abstraction.
- [x] Validate unknown API data before it reaches the domain.
- [x] Sort newest first and group under locale-aware month headings.
- [x] Communicate direction without relying only on color.
- [x] Calculate exact money-in and money-out totals.
- [x] Support loading, empty, failure, retry, and pull-to-refresh states.
- [x] Virtualize the history using FlashList.

Evidence: `src/features/transactions/{data,domain,hooks,screens}` and colocated tests.

## Transaction details

- [x] Navigate using a validated reference ID.
- [x] Seed detail queries from the list cache.
- [x] Handle direct loading, invalid IDs, missing records, and retries.
- [x] Display localized date, counterparty, signed amount, description, and reference.
- [x] Copy references and share accessible text details.
- [x] Generate and share a temporary PNG receipt.

Evidence: the detail route, `TransactionDetailScreen`, `TransactionReceipt`, and receipt service.

## Privacy and security

- [x] Persistently hide every monetary value.
- [x] Prevent text and receipt sharing while values are hidden.
- [x] Use native strong biometrics when supported and enrolled.
- [x] Keep operating-system device-credential fallback.
- [x] Re-lock after backgrounding.
- [x] Block capture, recording, and exposed app-switcher previews.
- [x] Exclude transaction payloads and PII from logs.
- [x] Disable Android application backup.

Evidence: `src/shared/security`, the safe logger, `app.json`, ADR 005, and tests.

## Resilience

- [x] Retry transient failures with bounded backoff.
- [x] Never retry or conceal data-contract failures.
- [x] Cache only validated domain transactions.
- [x] Validate, version, and expire offline data.
- [x] Identify cached data and its timestamp.
- [x] Preserve successful reads when cache persistence fails.

Evidence: query configuration, offline repository, offline banner, and ADR 006.

## Engineering quality

- [x] Strict TypeScript and feature dependency boundaries.
- [x] Integer minor-unit money model.
- [x] Light/dark themes and semantic accessibility.
- [x] Unit and integration thresholds enforced in CI.
- [x] Installed-app Maestro journeys.
- [x] Conventional commits, PR template, Dependabot, and secret scanning.
- [x] Architectural decisions recorded as ADRs.

## Explicit production gaps

The assessment uses a supplied local response rather than bank infrastructure. These remain real integration tasks rather than simulated claims:

- Live authenticated API, token lifecycle, authorization, and fraud controls
- Certificate pinning and production observability
- Compliance approval for offline financial-data retention
- Signed EAS release profiles and store distribution
- Full physical-device and assistive-technology certification matrix
