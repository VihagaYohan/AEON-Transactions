import { DataContractError, NetworkError } from '@/shared/lib/errors';
import { initialDataFreshness, useDataFreshnessStore } from '@/shared/store/dataFreshnessStore';
import { makeTransaction } from '@/test/factories';

import {
  OfflineTransactionRepository,
  type TransactionCacheStorage,
} from '../offlineTransactionRepository';
import type { TransactionRepository } from '../transactionRepository';

const createStorage = (): TransactionCacheStorage & { values: Map<string, string> } => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: jest.fn((key) => Promise.resolve(values.get(key) ?? null)),
    setItem: jest.fn((key, value) => {
      values.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      values.delete(key);
      return Promise.resolve();
    }),
  };
};

const createUpstream = (): jest.Mocked<TransactionRepository> => ({
  list: jest.fn(),
  getById: jest.fn(),
});

describe('OfflineTransactionRepository', () => {
  beforeEach(() => useDataFreshnessStore.setState(initialDataFreshness));

  it('returns network data and stores a versioned cache', async () => {
    const upstream = createUpstream();
    const storage = createStorage();
    upstream.list.mockResolvedValueOnce([makeTransaction({ refId: 'LIVE1' })]);
    const repository = new OfflineTransactionRepository(upstream, storage, {
      now: () => new Date('2024-10-15T13:00:00Z'),
    });

    await expect(repository.list()).resolves.toEqual([expect.objectContaining({ refId: 'LIVE1' })]);
    expect(storage.setItem).toHaveBeenCalledWith(
      'transactions-cache:v1',
      expect.stringContaining('"version":1'),
    );
    expect(useDataFreshnessStore.getState().source).toBe('network');
  });

  it('falls back to fresh cached transactions after a network failure', async () => {
    const upstream = createUpstream();
    const storage = createStorage();
    const transaction = makeTransaction({ refId: 'CACHED1' });
    upstream.list.mockResolvedValueOnce([transaction]).mockRejectedValueOnce(new NetworkError());
    const repository = new OfflineTransactionRepository(upstream, storage, {
      now: () => new Date('2024-10-15T13:00:00Z'),
    });
    await repository.list();

    await expect(repository.list()).resolves.toEqual([transaction]);
    expect(useDataFreshnessStore.getState()).toMatchObject({
      source: 'cache',
      cachedAt: new Date('2024-10-15T13:00:00Z'),
    });
  });

  it('does not hide backend contract failures behind cached data', async () => {
    const upstream = createUpstream();
    const storage = createStorage();
    upstream.list
      .mockResolvedValueOnce([makeTransaction()])
      .mockRejectedValueOnce(new DataContractError(['data.0.amount']));
    const repository = new OfflineTransactionRepository(upstream, storage);
    await repository.list();

    await expect(repository.list()).rejects.toBeInstanceOf(DataContractError);
  });

  it('rejects and removes expired cache data', async () => {
    const upstream = createUpstream();
    const storage = createStorage();
    let now = new Date('2024-10-15T13:00:00Z');
    upstream.list
      .mockResolvedValueOnce([makeTransaction()])
      .mockRejectedValueOnce(new NetworkError());
    const repository = new OfflineTransactionRepository(upstream, storage, {
      maxAgeMs: 1000,
      now: () => now,
    });
    await repository.list();
    now = new Date('2024-10-15T13:00:02Z');

    await expect(repository.list()).rejects.toBeInstanceOf(NetworkError);
    expect(storage.removeItem).toHaveBeenCalledWith('transactions-cache:v1');
  });

  it('rejects malformed cache content as a network failure', async () => {
    const upstream = createUpstream();
    const storage = createStorage();
    storage.values.set('transactions-cache:v1', '{not-json');
    upstream.list.mockRejectedValueOnce(new NetworkError());
    const repository = new OfflineTransactionRepository(upstream, storage);
    const warning = jest.spyOn(console, 'warn').mockImplementation();

    await expect(repository.list()).rejects.toBeInstanceOf(NetworkError);
    expect(warning).toHaveBeenCalledWith('[warn] Transaction cache read failed', '');
    warning.mockRestore();
  });

  it('does not fail a successful request when storage is unavailable', async () => {
    const upstream = createUpstream();
    const storage = createStorage();
    upstream.list.mockResolvedValueOnce([makeTransaction()]);
    jest.mocked(storage.setItem).mockRejectedValueOnce(new Error('storage unavailable'));
    const warning = jest.spyOn(console, 'warn').mockImplementation();
    const repository = new OfflineTransactionRepository(upstream, storage);

    await expect(repository.list()).resolves.toHaveLength(1);
    expect(warning).toHaveBeenCalledWith('[warn] Transaction cache write failed', '');
    warning.mockRestore();
  });

  it('finds a transaction through the same offline list path', async () => {
    const upstream = createUpstream();
    upstream.list.mockResolvedValueOnce([makeTransaction({ refId: 'DETAIL1' })]);
    const repository = new OfflineTransactionRepository(upstream, createStorage());

    await expect(repository.getById('DETAIL1')).resolves.toEqual(
      expect.objectContaining({ refId: 'DETAIL1' }),
    );
  });
});
