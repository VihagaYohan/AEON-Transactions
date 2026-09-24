import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricAuthenticator {
  isAvailable(): Promise<boolean>;
  authenticate(): Promise<{ success: boolean; error?: string }>;
}

/** Native device authentication kept behind an interface for deterministic tests. */
export const deviceBiometricAuthenticator: BiometricAuthenticator = {
  async isAvailable() {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    return hasHardware && isEnrolled;
  },
  async authenticate() {
    return LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock transactions',
      promptSubtitle: 'Confirm your identity to continue',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use device passcode',
      biometricsSecurityLevel: 'strong',
    });
  },
};
