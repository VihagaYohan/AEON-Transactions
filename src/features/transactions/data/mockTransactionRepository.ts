import { NetworkError } from '@/shared/lib/errors';

import { sortNewestFirst } from '../domain/operations';
import type { Transaction } from '../domain/transaction';
import sampleResponse from './__fixtures__/transactions.json';
import { parseTransactionsResponse } from './mapper';
import type { TransactionRepository } from './transactionRepository';

export interface MockRepositoryOptions {
  /** Simulated network latency. */
  latencyMs?: number;
  /** Probability from 0 through 1 that a request fails with NetworkError. */
  failRate?: number;
  /** Raw payload exactly as the backend would send it. */
  payload?: unknown;
  /** Injected for deterministic tests. */
  random?: () => number;
}

const wait = (milliseconds: number): Promise<void> =>
  milliseconds > 0
    ? new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
    : Promise.resolve();

/**
 * Serves the assessment response through the same validation and mapping path
 * that a real HTTP repository uses.
 */
export class MockTransactionRepository implements TransactionRepository {
  private readonly latencyMs: number;
  private readonly failRate: number;
  private readonly payload: unknown;
  private readonly random: () => number;

  constructor({
    latencyMs = 600,
    failRate = 0,
    payload = sampleResponse,
    random = Math.random,
  }: MockRepositoryOptions = {}) {
    this.latencyMs = latencyMs;
    this.failRate = failRate;
    this.payload = payload;
    this.random = random;
  }

  async list(): Promise<Transaction[]> {
    await wait(this.latencyMs);
    if (this.random() < this.failRate) throw new NetworkError();
    return sortNewestFirst(parseTransactionsResponse(this.payload));
  }

  async getById(refId: string): Promise<Transaction | undefined> {
    const transactions = await this.list();
    return transactions.find((transaction) => transaction.refId === refId);
  }
}
