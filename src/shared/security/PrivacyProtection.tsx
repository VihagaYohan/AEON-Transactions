import * as ScreenCapture from 'expo-screen-capture';
import { useEffect, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { logger } from '@/shared/lib/logger';

const SCREEN_CAPTURE_KEY = 'transaction-privacy';

/** Blocks captures and hides sensitive content in operating-system task previews. */
export const PrivacyProtection = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const enable = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync(SCREEN_CAPTURE_KEY);
        if (Platform.OS === 'ios') await ScreenCapture.enableAppSwitcherProtectionAsync(1);
      } catch {
        logger.warn('Screen privacy protection unavailable');
      }
    };

    void enable();

    return () => {
      void ScreenCapture.allowScreenCaptureAsync(SCREEN_CAPTURE_KEY);
      if (Platform.OS === 'ios') void ScreenCapture.disableAppSwitcherProtectionAsync();
    };
  }, []);

  return children;
};
