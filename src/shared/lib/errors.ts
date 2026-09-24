/** Base class so the UI can branch on `kind` without string matching. */
export abstract class AppError extends Error {
  abstract readonly kind: 'network' | 'data-contract';
}

export class NetworkError extends AppError {
  readonly kind = 'network' as const;

  constructor(message = 'Unable to reach the server') {
    super(message);
    this.name = 'NetworkError';
  }
}

/** The backend returned a payload that does not match the agreed contract. Not retryable. */
export class DataContractError extends AppError {
  readonly kind = 'data-contract' as const;

  constructor(readonly issuePaths: string[]) {
    super('Response did not match the expected contract');
    this.name = 'DataContractError';
  }
}

export const isRetryable = (error: unknown): boolean => !(error instanceof DataContractError);
