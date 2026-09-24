import type { Transaction } from '../domain/transaction';

/** The only way the app reads transactions. Swap the implementation, not the callers. */
export interface TransactionRepository {
  list(): Promise<Transaction[]>;
  getById(refId: string): Promise<Transaction | undefined>;
}
