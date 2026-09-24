import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import { formatMonthYear } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Screen, SkeletonList, StateView } from '@/shared/ui';

import { CashFlowSummary } from '../components/CashFlowSummary';
import { HideAmountsToggle } from '../components/HideAmountsToggle';
import { TransactionRow } from '../components/TransactionRow';
import { groupByMonth, summarise } from '../domain/operations';
import type { Transaction } from '../domain/transaction';
import { useTransactions } from '../hooks/useTransactions';

type ListItem =
  | { type: 'header'; key: string; label: string }
  | { type: 'transaction'; key: string; transaction: Transaction };

const toListItems = (transactions: readonly Transaction[]): ListItem[] =>
  groupByMonth(transactions).flatMap((section) => [
    {
      type: 'header' as const,
      key: `h-${section.key}`,
      label: formatMonthYear(section.month),
    },
    ...section.transactions.map((transaction) => ({
      type: 'transaction' as const,
      key: transaction.refId,
      transaction,
    })),
  ]);

export interface TransactionListScreenProps {
  /** Navigation is injected by the route so this screen can be tested without a router. */
  onOpenTransaction: (refId: string) => void;
}

export const TransactionListScreen = ({ onOpenTransaction }: TransactionListScreenProps) => {
  const { colors, spacing } = useTheme();
  const { data, isPending, isError, refetch, isRefetching } = useTransactions();

  // React Compiler memoizes these derived values, so manual useMemo calls are unnecessary.
  const items = data ? toListItems(data) : [];
  const stickyHeaderIndices = items.flatMap((item, index) =>
    item.type === 'header' ? [index] : [],
  );
  const summary = data ? summarise(data) : undefined;

  const header = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }}
    >
      <AppText variant="display" accessibilityRole="header">
        Transactions
      </AppText>
      <HideAmountsToggle />
    </View>
  );

  if (isPending) {
    return (
      <Screen>
        {header}
        <SkeletonList />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        {header}
        <StateView
          tone="danger"
          title="Couldn't load transactions"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {header}
      <FlashList
        testID="transaction-list"
        data={items}
        keyExtractor={(item) => item.key}
        getItemType={(item) => item.type}
        stickyHeaderIndices={stickyHeaderIndices}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        ListHeaderComponent={
          summary ? (
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
              <CashFlowSummary summary={summary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <StateView title="No transactions yet" message="New transfers will appear here." />
        }
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 68 }} />
        )}
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <View
              style={{
                backgroundColor: colors.background,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
              }}
            >
              <AppText variant="label" tone="muted" accessibilityRole="header">
                {item.label}
              </AppText>
            </View>
          ) : (
            <TransactionRow transaction={item.transaction} onPress={onOpenTransaction} />
          )
        }
      />
    </Screen>
  );
};
