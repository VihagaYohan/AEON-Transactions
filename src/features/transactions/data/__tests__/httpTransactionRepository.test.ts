import { DataContractError, NetworkError } from '@/shared/lib/errors';
import { logger } from '@/shared/lib/logger';

import sample from '../__fixtures__/transactions.json';
import { HttpTransactionRepository } from '../httpTransactionRepository';

const token = jest.fn().mockResolvedValue('test-token');
const repository = new HttpTransactionRepository('https://api.example.test', token);

const respond = (body: unknown, init: { ok?: boolean; status?: number } = {}) =>
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as Response);

describe('HttpTransactionRepository', () => {
  afterEach(() => jest.restoreAllMocks());

  it('sends the bearer token and returns validated, sorted transactions', async () => {
    const fetchMock = respond(sample);

    const list = await repository.list();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/transactions',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
    expect(list[0]?.refId).toBe('123ABC');
  });

  it('maps HTTP errors and offline failures to NetworkError', async () => {
    respond({}, { ok: false, status: 503 });
    await expect(repository.list()).rejects.toBeInstanceOf(NetworkError);

    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Network request failed'));
    await expect(repository.list()).rejects.toBeInstanceOf(NetworkError);
  });

  it('rejects payloads that break the contract', async () => {
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    respond({ items: [] });

    await expect(repository.list()).rejects.toBeInstanceOf(DataContractError);
  });

  it('finds a transaction by refId', async () => {
    respond(sample);

    expect((await repository.getById('101JKL'))?.name).toBe('Bonus Payment');
  });
});
