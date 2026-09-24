import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { Share } from 'react-native';

import {
  buildShareMessage,
  shareTransactionReceipt,
  TransactionDetailScreen,
} from '@/features/transactions';

export default function TransactionDetailRoute() {
  const params = useLocalSearchParams<{ refId?: string | string[] }>();
  const refId = Array.isArray(params.refId) ? (params.refId[0] ?? '') : (params.refId ?? '');

  return (
    <TransactionDetailScreen
      refId={refId}
      onGoBack={() => router.back()}
      onCopyReference={(reference) => Clipboard.setStringAsync(reference).then(() => undefined)}
      onShareReceipt={(_transaction, view) => shareTransactionReceipt(view)}
      onShare={async (transaction) => {
        await Share.share(
          { message: buildShareMessage(transaction), title: 'Transfer details' },
          { dialogTitle: 'Share transfer details' },
        );
      }}
    />
  );
}
