import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricAuthenticator {
  isAvailable(): Promise<boolean>;
  availableMethods(): Promise<string[]>;
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
  async availableMethods() {
    if (Platform.OS === 'web' || !(await this.isAvailable())) return [];
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const methods: string[] = [];
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT))
      methods.push('Fingerprint');
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      methods.push(Platform.OS === 'ios' ? 'Face ID' : 'Face recognition');
    }
    return methods;
  },
  async authenticate() {
    return LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock transactions',
      promptSubtitle: 'Confirm your identity to continue',
      cancelLabel: 'Cancel',
      fallbackLabel: '',
      disableDeviceFallback: true,
      biometricsSecurityLevel: 'weak',
    });
  },
};
