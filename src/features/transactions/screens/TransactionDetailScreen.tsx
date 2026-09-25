import { ScrollView, View } from 'react-native';
import { useRef, useState } from 'react';

import { usePreferencesStore } from '@/shared/store/preferencesStore';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button, Screen, SkeletonList, StateView } from '@/shared/ui';

import { TransactionReceipt } from '../components/TransactionReceipt';
import { isValidRefId, type Transaction } from '../domain/transaction';
import { useTransaction } from '../hooks/useTransactions';

export interface TransactionDetailScreenProps {
  refId: string;
  onCopyReference: (refId: string) => Promise<void>;
  onShare: (transaction: Transaction) => Promise<void>;
  onShareReceipt: (transaction: Transaction, view: View) => Promise<void>;
  onGoBack: () => void;
}

export const TransactionDetailScreen = ({
  refId,
  onCopyReference,
  onShare,
  onShareReceipt,
  onGoBack,
}: TransactionDetailScreenProps) => {
  const { colors, radii, spacing } = useTheme();
  const amountsHidden = usePreferencesStore((state) => state.hideAmounts);
  const [copied, setCopied] = useState(false);
  const [isSharingReceipt, setIsSharingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState(false);
  const receiptRef = useRef<View>(null);
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

  const copyReference = async () => {
    await onCopyReference(transaction.refId);
    setCopied(true);
  };

  const shareReceipt = async () => {
    if (!receiptRef.current) return;
    setIsSharingReceipt(true);
    setReceiptError(false);
    try {
      await onShareReceipt(transaction, receiptRef.current);
    } catch {
      setReceiptError(true);
    } finally {
      setIsSharingReceipt(false);
    }
  };

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView
        testID="transaction-detail"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <TransactionReceipt ref={receiptRef} transaction={transaction} />

        <View style={{ gap: spacing.sm }}>
          <Button
            testID="copy-reference"
            label={copied ? 'Reference copied' : 'Copy reference'}
            variant="secondary"
            onPress={() => void copyReference()}
          />
          <Button
            testID="share-transaction"
            label="Share text details"
            onPress={() => void onShare(transaction)}
            disabled={amountsHidden}
            accessibilityHint={amountsHidden ? 'Show amounts before sharing' : undefined}
          />
          <Button
            testID="share-receipt"
            label="Share receipt image"
            variant="secondary"
            loading={isSharingReceipt}
            onPress={() => void shareReceipt()}
            disabled={amountsHidden}
            accessibilityHint={amountsHidden ? 'Show amounts before sharing' : undefined}
          />
          {receiptError ? (
            <AppText accessibilityRole="alert" tone="danger" style={{ textAlign: 'center' }}>
              Could not create the receipt. Please try again.
            </AppText>
          ) : null}
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
