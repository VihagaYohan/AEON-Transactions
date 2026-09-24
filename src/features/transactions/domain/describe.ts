import { formatDate, formatDateTime, formatMoney, formatMoneyForSpeech } from '@/shared/lib/format';

import type { Transaction } from './transaction';

/** Screen-reader label for a list row. It never relies on colour. */
export const describeTransaction = (transaction: Transaction, amountsHidden: boolean): string => {
  const verb = transaction.direction === 'incoming' ? 'received' : 'sent';
  const amount = amountsHidden ? 'amount hidden' : formatMoneyForSpeech(transaction.money);

  return `${transaction.name}, ${verb} ${amount}, ${formatDate(transaction.date)}`;
};

export const counterpartyLabel = (transaction: Transaction): 'From' | 'To' =>
  transaction.direction === 'incoming' ? 'From' : 'To';

/** Plain-text summary used by the OS share sheet. It includes only fields shown on screen. */
export const buildShareMessage = (transaction: Transaction): string =>
  [
    'Transfer details',
    `Reference ID: ${transaction.refId}`,
    `Date: ${formatDateTime(transaction.date)}`,
    `${counterpartyLabel(transaction)}: ${transaction.counterparty}`,
    `Amount: ${formatMoney(transaction.money, { signed: true })}`,
    `Description: ${transaction.name}`,
  ].join('\n');
