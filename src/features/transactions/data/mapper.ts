import { DataContractError } from '@/shared/lib/errors';
import { logger } from '@/shared/lib/logger';
import { money, toMinor } from '@/shared/lib/money';

import { directionOf, type Transaction } from '../domain/transaction';
import { TransactionsResponseSchema, type TransactionDto } from './schema';

export const toTransaction = (dto: TransactionDto): Transaction => {
  const amountMinor = toMinor(dto.amount);

  return {
    refId: dto.refId,
    name: dto.transferName,
    counterparty: dto.recipientName,
    date: new Date(dto.transferDate),
    money: money(amountMinor),
    direction: directionOf(amountMinor),
  };
};

/** Validates an unknown payload and maps it to domain entities. */
export const parseTransactionsResponse = (payload: unknown): Transaction[] => {
  const result = TransactionsResponseSchema.safeParse(payload);

  if (!result.success) {
    const paths = result.error.issues.map((issue) => issue.path.join('.'));
    // Log only failing paths because the payload contains PII.
    logger.warn('Transactions response failed validation', { paths: paths.join(',') });
    throw new DataContractError(paths);
  }

  return result.data.data.map(toTransaction);
};
