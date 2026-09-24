import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';

import { logger } from '@/shared/lib/logger';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button, Screen } from '@/shared/ui';

import { deviceBiometricAuthenticator, type BiometricAuthenticator } from './biometrics';

type GateStatus = 'checking' | 'locked' | 'unlocked';

interface SecurityGateProps extends PropsWithChildren {
  authenticator?: BiometricAuthenticator;
}

const authenticationMessage = (error?: string): string => {
  if (error === 'user_cancel' || error === 'system_cancel' || error === 'app_cancel') {
    return 'Authentication was cancelled.';
  }
  if (error === 'lockout') return 'Biometric authentication is temporarily locked.';
  return 'We could not verify your identity.';
};

/** Protects app content without storing or handling any biometric information. */
export const SecurityGate = ({
  children,
  authenticator = deviceBiometricAuthenticator,
}: SecurityGateProps) => {
  const { colors, spacing } = useTheme();
  const [status, setStatus] = useState<GateStatus>('checking');
  const [message, setMessage] = useState<string>();
  const authenticating = useRef(false);
  const relockOnActive = useRef(false);

  const unlock = useCallback(async () => {
    if (authenticating.current) return;
    authenticating.current = true;
    setStatus('checking');
    setMessage(undefined);

    try {
      if (!(await authenticator.isAvailable())) {
        setStatus('unlocked');
        return;
      }

      const result = await authenticator.authenticate();
      if (result.success) {
        setStatus('unlocked');
      } else {
        setMessage(authenticationMessage(result.error));
        setStatus('locked');
      }
    } catch {
      logger.warn('Device authentication unavailable');
      setMessage('Device authentication is currently unavailable.');
      setStatus('locked');
    } finally {
      authenticating.current = false;
    }
  }, [authenticator]);

  useEffect(() => {
    const initialAuthentication = setTimeout(() => void unlock(), 0);
    return () => clearTimeout(initialAuthentication);
  }, [unlock]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') {
        relockOnActive.current = true;
        setStatus('locked');
      } else if (nextState === 'active' && relockOnActive.current) {
        relockOnActive.current = false;
        void unlock();
      }
    });

    return () => subscription.remove();
  }, [unlock]);

  if (status === 'unlocked') return children;

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <AppText variant="title" tone="accent">
            AEON
          </AppText>
        </View>
        <AppText variant="title" accessibilityRole="header" style={{ textAlign: 'center' }}>
          Transactions locked
        </AppText>
        {status === 'checking' ? (
          <ActivityIndicator
            accessibilityLabel="Authenticating"
            color={colors.accent}
            size="large"
          />
        ) : (
          <>
            <AppText tone="muted" style={{ textAlign: 'center' }}>
              {message ?? 'Authenticate to view your transactions.'}
            </AppText>
            <Button label="Unlock" onPress={() => void unlock()} />
          </>
        )}
      </View>
    </Screen>
  );
};
