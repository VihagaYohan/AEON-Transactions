import { directionOf, type Transaction } from '@/features/transactions/domain/transaction';
import { money } from '@/shared/lib/money';

let sequence = 0;

export const makeTransaction = (
  overrides: Partial<Omit<Transaction, 'money' | 'direction'>> & { amountMinor?: number } = {},
): Transaction => {
  sequence += 1;
  const { amountMinor = 150000, ...rest } = overrides;

  return {
    refId: `TX${sequence}`,
    name: 'Salary Payment',
    counterparty: 'John Doe',
    date: new Date('2024-10-15T12:34:56Z'),
    money: money(amountMinor),
    direction: directionOf(amountMinor),
    ...rest,
  };
};
