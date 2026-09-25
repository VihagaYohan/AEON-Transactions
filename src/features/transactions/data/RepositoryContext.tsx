import { createContext, useContext, type PropsWithChildren } from 'react';

import type { TransactionRepository } from './transactionRepository';

const RepositoryContext = createContext<TransactionRepository | null>(null);

/** Dependency injection: tests and the demo pass a mock, while production passes HTTP. */
export const TransactionRepositoryProvider = ({
  repository,
  children,
}: PropsWithChildren<{ repository: TransactionRepository }>) => (
  <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>
);

export const useTransactionRepository = (): TransactionRepository => {
  const repository = useContext(RepositoryContext);

  if (!repository) {
    throw new Error('useTransactionRepository must be used inside TransactionRepositoryProvider');
  }

  return repository;
};
