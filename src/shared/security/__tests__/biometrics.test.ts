import * as LocalAuthentication from 'expo-local-authentication';

import { deviceBiometricAuthenticator } from '../biometrics';

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
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

  it('requests strong authentication with device fallback', async () => {
    authenticate.mockResolvedValueOnce({ success: true });

    await expect(deviceBiometricAuthenticator.authenticate()).resolves.toEqual({ success: true });
    expect(authenticate).toHaveBeenCalledWith(
      expect.objectContaining({
        promptMessage: 'Unlock transactions',
        biometricsSecurityLevel: 'strong',
        fallbackLabel: 'Use device passcode',
      }),
    );
  });
});
