import { router } from 'expo-router';

import { TransactionListScreen } from '@/features/transactions';

export default function TransactionsRoute() {
  return (
    <TransactionListScreen
      onOpenTransaction={(refId) =>
        router.push({ pathname: '/transactions/[refId]', params: { refId } })
      }
    />
  );
}
