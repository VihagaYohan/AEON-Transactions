import type { Money } from '@/shared/lib/money';

export type Direction = 'incoming' | 'outgoing';

/** A validated, UI-agnostic transaction. The API shape never leaks past the data layer. */
export interface Transaction {
  readonly refId: string;
  /** API: transferName, e.g. "Salary Payment". */
  readonly name: string;
  /** API: recipientName, the other party of the transfer. */
  readonly counterparty: string;
  /** Parsed from the API UTC ISO-8601 string. */
  readonly date: Date;
  /** Signed amount in minor units. */
  readonly money: Money;
  readonly direction: Direction;
}

/** Assumption documented in the README: the sign of the amount is the direction. */
export const directionOf = (amountMinor: number): Direction =>
  amountMinor < 0 ? 'outgoing' : 'incoming';

/** Reference IDs are short uppercase alphanumerics. This also guards deep links. */
export const REF_ID_PATTERN = /^[A-Z0-9]{1,20}$/;

export const isValidRefId = (value: unknown): value is string =>
  typeof value === 'string' && REF_ID_PATTERN.test(value);
