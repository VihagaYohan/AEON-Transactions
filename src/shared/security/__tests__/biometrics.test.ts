import * as LocalAuthentication from 'expo-local-authentication';

import { deviceBiometricAuthenticator } from '../biometrics';

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
}));

const hasHardware = jest.mocked(LocalAuthentication.hasHardwareAsync);
const isEnrolled = jest.mocked(LocalAuthentication.isEnrolledAsync);
const authenticate = jest.mocked(LocalAuthentication.authenticateAsync);

describe('deviceBiometricAuthenticator', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is available only when hardware and enrollment are present', async () => {
    hasHardware.mockResolvedValueOnce(true);
    isEnrolled.mockResolvedValueOnce(true);
    await expect(deviceBiometricAuthenticator.isAvailable()).resolves.toBe(true);

    hasHardware.mockResolvedValueOnce(true);
    isEnrolled.mockResolvedValueOnce(false);
    await expect(deviceBiometricAuthenticator.isAvailable()).resolves.toBe(false);
  });

  it('only exposes supported methods when enrolled', async () => {
    hasHardware.mockResolvedValue(true);
    isEnrolled.mockResolvedValue(false);
    await expect(deviceBiometricAuthenticator.availableMethods()).resolves.toEqual([]);
    isEnrolled.mockResolvedValue(true);
    jest.mocked(LocalAuthentication.supportedAuthenticationTypesAsync).mockResolvedValue([1]);
    await expect(deviceBiometricAuthenticator.availableMethods()).resolves.toEqual(['Fingerprint']);
    jest.mocked(LocalAuthentication.supportedAuthenticationTypesAsync).mockResolvedValue([2]);
    await expect(deviceBiometricAuthenticator.availableMethods()).resolves.toEqual(['Face ID']);
  });

  it('requests biometrics without passcode fallback', async () => {
    authenticate.mockResolvedValueOnce({ success: true });

    await expect(deviceBiometricAuthenticator.authenticate()).resolves.toEqual({ success: true });
    expect(authenticate).toHaveBeenCalledWith(
      expect.objectContaining({
        promptMessage: 'Unlock transactions',
        biometricsSecurityLevel: 'weak',
        fallbackLabel: '',
        disableDeviceFallback: true,
      }),
    );
  });
});
