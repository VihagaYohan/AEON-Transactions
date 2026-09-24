import { DataContractError, NetworkError } from '@/shared/lib/errors';

import { createQueryClient } from '../queryClient';

describe('createQueryClient', () => {
  const retry = createQueryClient().getDefaultOptions().queries?.retry as (
    failureCount: number,
    error: unknown,
  ) => boolean;

  it('retries transient network errors up to twice', () => {
    expect(retry(0, new NetworkError())).toBe(true);
    expect(retry(1, new NetworkError())).toBe(true);
    expect(retry(2, new NetworkError())).toBe(false);
  });

  it('never retries a broken data contract', () => {
    expect(retry(0, new DataContractError(['data']))).toBe(false);
  });
});
