import sampleResponse from '../__fixtures__/transactions.json';

import { NetworkError } from '@/shared/lib/errors';

import { MockTransactionRepository } from '../mockTransactionRepository';

describe('MockTransactionRepository', () => {
  it('provides a stable, varied demo feed with resolvable unique references', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0 });
    const list = await repository.list();
    expect(list).toHaveLength(244);
    expect(new Set(list.map((item) => item.refId)).size).toBe(list.length);
    expect(await repository.list()).toEqual(list);
    expect(list.every((item, index) => index === 0 || list[index - 1]!.date >= item.date)).toBe(
      true,
    );
    expect(new Set(list.map((item) => item.direction)).size).toBe(2);
    expect(new Set(list.map((item) => item.date.getUTCMonth())).size).toBeGreaterThan(4);
    const last = list[list.length - 1]!;
    expect(await repository.getById(last.refId)).toEqual(last);
  });

  it('returns the sample transactions newest first', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0, payload: sampleResponse });
    const list = await repository.list();

    expect(list.map((transaction) => transaction.refId)).toEqual([
      '123ABC',
      '789GHI',
      '456DEF',
      '101JKL',
    ]);
  });

  it('finds a transaction by refId', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0, payload: sampleResponse });

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
    const repository = new MockTransactionRepository({ latencyMs: 600, payload: sampleResponse });
    const promise = repository.list();

    await jest.advanceTimersByTimeAsync(600);
    await expect(promise).resolves.toHaveLength(4);
    jest.useRealTimers();
  });
});
