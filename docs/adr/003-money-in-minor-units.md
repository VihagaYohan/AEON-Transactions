# ADR-003: Money as integer minor units

- Status: Accepted
- Date: 2026-09-24

## Context

The API sends amounts as decimals such as `2300.75`. Adding binary floating-point values drifts (`0.1 + 0.2 !== 0.3`), which is unacceptable for a bank.

## Decision

Convert to integer sen at the API boundary with `toMinor`, keep `Money { amountMinor, currency }` throughout the domain, and format only for display. The currency is `MYR` because the brief has no currency field and AEON Bank operates in Malaysia.

Formatting adds the `RM` symbol and sign manually instead of using `style: 'currency'` or `signDisplay`, because ICU output differs between Hermes on iOS, Hermes on Android, and Node.

## Consequences

- Totals are exact. Tests cover `0.1 + 0.2` and repeated sums.
- A multi-currency backend would add `currency` to the DTO; the domain type already carries it.
