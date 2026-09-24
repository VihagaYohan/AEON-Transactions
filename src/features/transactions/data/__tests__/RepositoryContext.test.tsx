import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import type { TransactionRepository } from '../transactionRepository';
import { TransactionRepositoryProvider, useTransactionRepository } from '../RepositoryContext';

const repository: TransactionRepository = {
  list: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue(undefined),
};

describe('TransactionRepositoryProvider', () => {
  it('provides the repository to feature hooks', async () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <TransactionRepositoryProvider repository={repository}>
        {children}
      </TransactionRepositoryProvider>
    );

    const { result } = await renderHook(() => useTransactionRepository(), { wrapper });

    expect(result.current).toBe(repository);
  });

  it('rejects consumers outside the provider', async () => {
    await expect(renderHook(() => useTransactionRepository())).rejects.toThrow(
      'useTransactionRepository must be used inside TransactionRepositoryProvider',
    );
  });
});
