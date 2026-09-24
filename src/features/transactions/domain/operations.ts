import { money, sumMoney, type Money } from '@/shared/lib/money';

import type { Transaction } from './transaction';

export const sortNewestFirst = (transactions: readonly Transaction[]): Transaction[] =>
  [...transactions].sort((first, second) => second.date.getTime() - first.date.getTime());

export interface MonthSection {
  /** Stable key, e.g. "2024-10" in local time. */
  readonly key: string;
  /** Month start in local time, used for the header label. */
  readonly month: Date;
  readonly transactions: readonly Transaction[];
}

/** Groups already-sorted transactions by local calendar month while preserving order. */
export const groupByMonth = (transactions: readonly Transaction[]): MonthSection[] => {
  const sections: { key: string; month: Date; transactions: Transaction[] }[] = [];

  for (const transaction of transactions) {
    const key = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
    const last = sections[sections.length - 1];

    if (last && last.key === key) {
      last.transactions.push(transaction);
    } else {
      sections.push({
        key,
        month: new Date(transaction.date.getFullYear(), transaction.date.getMonth(), 1),
        transactions: [transaction],
      });
    }
  }

  return sections;
};

export interface CashFlow {
  readonly moneyIn: Money;
  readonly moneyOut: Money;
  readonly net: Money;
}

/** Totals are computed in integer minor units to avoid floating-point drift. */
export const summarise = (transactions: readonly Transaction[]): CashFlow => {
  const incoming = transactions
    .filter((transaction) => transaction.direction === 'incoming')
    .map((transaction) => transaction.money);
  const outgoing = transactions
    .filter((transaction) => transaction.direction === 'outgoing')
    .map((transaction) => transaction.money);
  const moneyIn = sumMoney(incoming);
  const moneyOut = sumMoney(outgoing);

  return {
    moneyIn,
    moneyOut,
    net: money(moneyIn.amountMinor + moneyOut.amountMinor),
  };
};
