/**
 * Money is stored in minor units (sen) as an integer to avoid floating-point errors.
 * RM 1,500.00 -> 150000. The sign is preserved (negative = money out).
 */
export type Currency = 'MYR';

export interface Money {
  readonly amountMinor: number;
  readonly currency: Currency;
}

/** Converts a major-unit decimal from the API (e.g. 2300.75) to integer minor units. */
export const toMinor = (major: number): number => Math.round(major * 100);

export const money = (amountMinor: number, currency: Currency = 'MYR'): Money => ({
  amountMinor,
  currency,
});

export const sumMoney = (items: readonly Money[], currency: Currency = 'MYR'): Money =>
  money(
    items.reduce((total, item) => total + item.amountMinor, 0),
    currency,
  );
