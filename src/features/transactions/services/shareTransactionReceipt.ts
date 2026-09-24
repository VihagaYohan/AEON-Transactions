import * as Sharing from 'expo-sharing';
import type { View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';

interface ReceiptSharingDependencies {
  canShare: () => Promise<boolean>;
  capture: (view: View) => Promise<string>;
  share: (uri: string) => Promise<void>;
  release: (uri: string) => void;
}

const defaultDependencies: ReceiptSharingDependencies = {
  canShare: Sharing.isAvailableAsync,
  capture: (view) =>
    captureRef(view, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      fileName: 'transaction-receipt.png',
    }),
  share: (uri) =>
    Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle: 'Share transaction receipt',
    }),
  release: releaseCapture,
};

export const shareTransactionReceipt = async (
  view: View,
  dependencies: ReceiptSharingDependencies = defaultDependencies,
): Promise<void> => {
  if (!(await dependencies.canShare())) {
    throw new Error('File sharing is unavailable on this device');
  }

  let capturedUri: string | undefined;
  try {
    capturedUri = await dependencies.capture(view);
    const shareableUri = capturedUri.startsWith('file://') ? capturedUri : `file://${capturedUri}`;
    await dependencies.share(shareableUri);
  } finally {
    if (capturedUri) dependencies.release(capturedUri);
  }
};
