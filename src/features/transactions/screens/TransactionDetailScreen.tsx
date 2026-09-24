import { ScrollView, View } from 'react-native';

import { formatDateTime } from '@/shared/lib/format';
import { useTransientFlag } from '@/shared/lib/useTransientFlag';
import { usePreferencesStore } from '@/shared/store/preferencesStore';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button, Card, Screen, SkeletonList, StateView } from '@/shared/ui';

import { AmountText } from '../components/AmountText';
import { DetailField } from '../components/DetailField';
import { DirectionIcon } from '../components/DirectionIcon';
import { counterpartyLabel } from '../domain/describe';
import { isValidRefId, type Transaction } from '../domain/transaction';
import { useTransaction } from '../hooks/useTransactions';

export interface TransactionDetailScreenProps {
  refId: string;
  onCopyReference: (refId: string) => Promise<void>;
  onShare: (transaction: Transaction) => Promise<void>;
  onGoBack: () => void;
}

export const TransactionDetailScreen = ({
  refId,
  onCopyReference,
  onShare,
  onGoBack,
}: TransactionDetailScreenProps) => {
  const { colors, radii, spacing } = useTheme();
  const amountsHidden = usePreferencesStore((state) => state.hideAmounts);
  const [copied, showCopied] = useTransientFlag();
  const { data: transaction, isPending, isError, refetch } = useTransaction(refId);

  if (!isValidRefId(refId)) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <StateView
          title="Invalid transaction link"
          message="This transaction reference is not valid."
          actionLabel="Back to transactions"
          onAction={onGoBack}
        />
      </Screen>
    );
  }

  if (isPending) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <StateView
          tone="danger"
          title="Couldn't load transaction"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  if (!transaction) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <StateView
          title="Transaction not found"
          message="It may have been removed or the link may be out of date."
          actionLabel="Back to transactions"
          onAction={onGoBack}
        />
      </Screen>
    );
  }

  const directionLabel = transaction.direction === 'incoming' ? 'Money received' : 'Money sent';

  const copyReference = async () => {
    await onCopyReference(transaction.refId);
    showCopied();
  };

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }}>
          <DirectionIcon direction={transaction.direction} />
          <AppText variant="label" tone="muted">
            {directionLabel}
          </AppText>
          <AmountText money={transaction.money} variant="display" signed />
          <AppText variant="title" accessibilityRole="header" style={{ textAlign: 'center' }}>
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

        <View style={{ gap: spacing.sm }}>
          <Button
            label={copied ? 'Reference copied' : 'Copy reference'}
            variant="secondary"
            onPress={() => void copyReference()}
          />
          <Button
            label="Share transaction"
            onPress={() => void onShare(transaction)}
            disabled={amountsHidden}
            accessibilityHint={amountsHidden ? 'Show amounts before sharing' : undefined}
          />
          {amountsHidden ? (
            <View
              style={{
                backgroundColor: colors.surfaceMuted,
                borderRadius: radii.md,
                padding: spacing.md,
              }}
            >
              <AppText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
                Show amounts on the transaction list before sharing.
              </AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
};
