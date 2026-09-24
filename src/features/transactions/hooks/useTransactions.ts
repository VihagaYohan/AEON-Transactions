import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useTransactionRepository } from '../data/RepositoryContext';
import type { Transaction } from '../domain/transaction';
import { transactionKeys } from './queryKeys';

/** Server state for the cached, retried, and focus-refetched transaction list. */
export const useTransactions = () => {
  const repository = useTransactionRepository();

  return useQuery({
    queryKey: transactionKeys.all,
    queryFn: () => repository.list(),
  });
};

/** One transaction seeded from the list cache so opening its details is immediate. */
export const useTransaction = (refId: string) => {
  const repository = useTransactionRepository();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: transactionKeys.detail(refId),
    queryFn: async () => (await repository.getById(refId)) ?? null,
    initialData: () =>
      queryClient
        .getQueryData<Transaction[]>(transactionKeys.all)
        ?.find((transaction) => transaction.refId === refId),
    initialDataUpdatedAt: () => queryClient.getQueryState(transactionKeys.all)?.dataUpdatedAt,
  });
};
