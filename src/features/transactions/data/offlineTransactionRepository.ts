import { z } from 'zod';

import { NetworkError } from '@/shared/lib/errors';
import { logger } from '@/shared/lib/logger';
import { money } from '@/shared/lib/money';
import { useDataFreshnessStore } from '@/shared/store/dataFreshnessStore';

import { sortNewestFirst } from '../domain/operations';
import type { Transaction } from '../domain/transaction';
import type { TransactionRepository } from './transactionRepository';

const CACHE_KEY = 'transactions-cache:v1';
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const CachedTransactionSchema = z.object({
  refId: z.string().min(1),
  name: z.string().min(1),
  counterparty: z.string().min(1),
  date: z.iso.datetime(),
  amountMinor: z.number().int(),
  currency: z.literal('MYR'),
  direction: z.enum(['incoming', 'outgoing']),
});

const CacheEnvelopeSchema = z.object({
  version: z.literal(1),
  savedAt: z.iso.datetime(),
  transactions: z.array(CachedTransactionSchema),
});

export interface TransactionCacheStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface OfflineRepositoryOptions {
  maxAgeMs?: number;
  now?: () => Date;
}

/** Adds bounded offline reads without changing the upstream repository contract. */
export class OfflineTransactionRepository implements TransactionRepository {
  private readonly maxAgeMs: number;
  private readonly now: () => Date;

  constructor(
    private readonly upstream: TransactionRepository,
    private readonly storage: TransactionCacheStorage,
    { maxAgeMs = DEFAULT_MAX_AGE_MS, now = () => new Date() }: OfflineRepositoryOptions = {},
  ) {
    this.maxAgeMs = maxAgeMs;
    this.now = now;
  }

  async list(): Promise<Transaction[]> {
    let transactions: Transaction[];

    try {
      transactions = await this.upstream.list();
    } catch (error) {
      if (!(error instanceof NetworkError)) throw error;
      return this.readCacheOrThrow(error);
    }

    useDataFreshnessStore.getState().markNetwork();
    await this.writeCache(transactions);
    return transactions;
  }

  async getById(refId: string): Promise<Transaction | undefined> {
    return (await this.list()).find((transaction) => transaction.refId === refId);
  }

  private async writeCache(transactions: readonly Transaction[]): Promise<void> {
    const savedAt = this.now().toISOString();
    const serialized = JSON.stringify({
      version: 1,
      savedAt,
      transactions: transactions.map((transaction) => ({
        refId: transaction.refId,
        name: transaction.name,
        counterparty: transaction.counterparty,
        date: transaction.date.toISOString(),
        amountMinor: transaction.money.amountMinor,
        currency: transaction.money.currency,
        direction: transaction.direction,
      })),
    });

    try {
      await this.storage.setItem(CACHE_KEY, serialized);
    } catch {
      // A cache write must never turn a successful network response into an app error.
      logger.warn('Transaction cache write failed');
    }
  }

  private async readCacheOrThrow(networkError: NetworkError): Promise<Transaction[]> {
    try {
      const serialized = await this.storage.getItem(CACHE_KEY);
      if (!serialized) throw networkError;

      const result = CacheEnvelopeSchema.safeParse(JSON.parse(serialized));
      if (!result.success) {
        await this.storage.removeItem(CACHE_KEY);
        throw networkError;
      }

      const savedAt = new Date(result.data.savedAt);
      if (this.now().getTime() - savedAt.getTime() > this.maxAgeMs) {
        await this.storage.removeItem(CACHE_KEY);
        throw networkError;
      }

      useDataFreshnessStore.getState().markCache(savedAt);
      return sortNewestFirst(
        result.data.transactions.map((transaction) => ({
          refId: transaction.refId,
          name: transaction.name,
          counterparty: transaction.counterparty,
          date: new Date(transaction.date),
          money: money(transaction.amountMinor, transaction.currency),
          direction: transaction.direction,
        })),
      );
    } catch (error) {
      if (error === networkError) throw error;
      logger.warn('Transaction cache read failed');
      throw networkError;
    }
  }
}
