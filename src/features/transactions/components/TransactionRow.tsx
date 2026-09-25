import { Pressable, View } from 'react-native';

import { formatDateTime } from '@/shared/lib/format';
import { usePreferencesStore } from '@/shared/store/preferencesStore';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui/AppText';

import { describeTransaction } from '../domain/describe';
import type { Transaction } from '../domain/transaction';
import { AmountText } from './AmountText';
import { DirectionIcon } from './DirectionIcon';

interface TransactionRowProps {
  transaction: Transaction;
  onPress: (refId: string) => void;
}

// React Compiler handles memoization for this frequently rendered row.
export const TransactionRow = ({ transaction, onPress }: TransactionRowProps) => {
  const { colors, spacing } = useTheme();
  const hidden = usePreferencesStore((state) => state.hideAmounts);

  return (
    <Pressable
      testID={`transaction-${transaction.refId}`}
      accessibilityRole="button"
      accessibilityLabel={describeTransaction(transaction, hidden)}
      accessibilityHint="Opens transaction details"
      onPress={() => onPress(transaction.refId)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 64,
        backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
      })}
    >
      <DirectionIcon direction={transaction.direction} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="heading" numberOfLines={1}>
          {transaction.name}
        </AppText>
        <AppText variant="caption" tone="muted">
          {formatDateTime(transaction.date)}
        </AppText>
      </View>
      <AmountText money={transaction.money} variant="heading" />
    </Pressable>
  );
};
