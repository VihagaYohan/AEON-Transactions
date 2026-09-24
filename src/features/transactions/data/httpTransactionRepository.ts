import { NetworkError } from '@/shared/lib/errors';

import { sortNewestFirst } from '../domain/operations';
import type { Transaction } from '../domain/transaction';
import { parseTransactionsResponse } from './mapper';
import type { TransactionRepository } from './transactionRepository';

/**
 * Real-backend adapter. It is not wired into the demo, but demonstrates that
 * callers do not change when the mock repository is replaced.
 */
export class HttpTransactionRepository implements TransactionRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly getAccessToken: () => Promise<string>,
  ) {}

  async list(): Promise<Transaction[]> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/transactions`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${await this.getAccessToken()}`,
        },
      });
    } catch {
      throw new NetworkError();
    }

    if (!response.ok) throw new NetworkError(`HTTP ${response.status}`);
    return sortNewestFirst(parseTransactionsResponse(await response.json()));
  }

  async getById(refId: string): Promise<Transaction | undefined> {
    return (await this.list()).find((transaction) => transaction.refId === refId);
  }
}
