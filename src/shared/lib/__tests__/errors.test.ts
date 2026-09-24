import { DataContractError, isRetryable, NetworkError } from '../errors';

describe('isRetryable', () => {
  it('retries network failures but not contract violations', () => {
    expect(isRetryable(new NetworkError())).toBe(true);
    expect(isRetryable(new DataContractError(['data']))).toBe(false);
  });
});
