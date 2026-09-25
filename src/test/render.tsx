import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import sampleResponse from '@/features/transactions/data/__fixtures__/transactions.json';

import { TransactionRepositoryProvider } from '@/features/transactions/data/RepositoryContext';
import { MockTransactionRepository } from '@/features/transactions/data/mockTransactionRepository';
import type { TransactionRepository } from '@/features/transactions/data/transactionRepository';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

interface Options {
  repository?: TransactionRepository;
  queryClient?: QueryClient;
}

/** Renders real providers and hooks while allowing the data source to be replaced. */
export const renderWithProviders = async (
  ui: ReactElement,
  {
    repository = new MockTransactionRepository({ latencyMs: 0, payload: sampleResponse }),
    queryClient = createTestQueryClient(),
  }: Options = {},
) => {
  const view = await render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <QueryClientProvider client={queryClient}>
        <TransactionRepositoryProvider repository={repository}>{ui}</TransactionRepositoryProvider>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );

  return { ...view, queryClient, repository };
};
