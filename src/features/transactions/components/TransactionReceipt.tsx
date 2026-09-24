import type { Ref } from 'react';
import { View } from 'react-native';

import { formatDateTime } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Card } from '@/shared/ui';

import { counterpartyLabel } from '../domain/describe';
import type { Transaction } from '../domain/transaction';
import { AmountText } from './AmountText';
import { DetailField } from './DetailField';
import { DirectionIcon } from './DirectionIcon';

interface TransactionReceiptProps {
  transaction: Transaction;
  ref?: Ref<View>;
}

/** On-screen receipt designed to be captured as a portable image. */
export const TransactionReceipt = ({ transaction, ref }: TransactionReceiptProps) => {
  const { colors, spacing } = useTheme();
  const directionLabel = transaction.direction === 'incoming' ? 'Money received' : 'Money sent';

  return (
    <View
      ref={ref}
      collapsable={false}
      testID="transaction-receipt"
      style={{ backgroundColor: colors.background, padding: spacing.md, gap: spacing.lg }}
    >
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label" tone="accent">
          AEON BANK
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          Transaction receipt
        </AppText>
      </View>

      <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }}>
        <DirectionIcon direction={transaction.direction} />
        <AppText variant="label" tone="muted">
          {directionLabel}
        </AppText>
        <AmountText money={transaction.money} variant="display" signed />
        <AppText variant="title" style={{ textAlign: 'center' }}>
          {transaction.name}
        </AppText>
      </View>

      <Card style={{ gap: spacing.lg }}>
        <DetailField label={counterpartyLabel(transaction)} value={transaction.counterparty} />
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <DetailField label="Date and time" value={formatDateTime(transaction.date)} />
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <DetailField label="Reference ID" value={transaction.refId} testID="reference-id" />
      </Card>
    </View>
  );
};
