import { NetworkError } from '@/shared/lib/errors';

import { MockTransactionRepository } from '../mockTransactionRepository';

describe('MockTransactionRepository', () => {
  it('returns the sample transactions newest first', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0 });
    const list = await repository.list();

    expect(list.map((transaction) => transaction.refId)).toEqual([
      '123ABC',
      '789GHI',
      '456DEF',
      '101JKL',
    ]);
  });

  it('finds a transaction by refId', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0 });

    expect((await repository.getById('789GHI'))?.name).toBe('Refund');
    expect(await repository.getById('NOPE')).toBeUndefined();
  });

  it('fails with NetworkError according to the fail rate', async () => {
    const repository = new MockTransactionRepository({
      latencyMs: 0,
      failRate: 0.5,
      random: () => 0.1,
    });

    await expect(repository.list()).rejects.toBeInstanceOf(NetworkError);
  });

  it('simulates latency', async () => {
    jest.useFakeTimers();
    const repository = new MockTransactionRepository({ latencyMs: 600 });
    const promise = repository.list();

    await jest.advanceTimersByTimeAsync(600);
    await expect(promise).resolves.toHaveLength(4);
    jest.useRealTimers();
  });
});
