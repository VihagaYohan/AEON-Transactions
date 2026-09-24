import { act, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

import { AppText } from '@/shared/ui';

import type { BiometricAuthenticator } from '../biometrics';
import { SecurityGate } from '../SecurityGate';

const makeAuthenticator = (
  overrides: Partial<BiometricAuthenticator> = {},
): BiometricAuthenticator => ({
  isAvailable: jest.fn(() => Promise.resolve(true)),
  authenticate: jest.fn(() => Promise.resolve({ success: true })),
  ...overrides,
});

describe('SecurityGate', () => {
  it('shows protected content after successful authentication', async () => {
    const authenticator = makeAuthenticator();
    await render(
      <SecurityGate authenticator={authenticator}>
        <AppText>Protected transactions</AppText>
      </SecurityGate>,
    );

    expect(await screen.findByText('Protected transactions')).toBeOnTheScreen();
    expect(authenticator.authenticate).toHaveBeenCalledTimes(1);
  });

  it('keeps the app usable when biometrics are not available or enrolled', async () => {
    const authenticator = makeAuthenticator({
      isAvailable: jest.fn(() => Promise.resolve(false)),
    });
    await render(
      <SecurityGate authenticator={authenticator}>
        <AppText>Protected transactions</AppText>
      </SecurityGate>,
    );

    expect(await screen.findByText('Protected transactions')).toBeOnTheScreen();
    expect(authenticator.authenticate).not.toHaveBeenCalled();
  });

  it('stays locked after cancellation and allows a retry', async () => {
    const authenticate = jest
      .fn()
      .mockResolvedValueOnce({ success: false, error: 'user_cancel' })
      .mockResolvedValueOnce({ success: true });
    const authenticator = makeAuthenticator({ authenticate });
    await render(
      <SecurityGate authenticator={authenticator}>
        <AppText>Protected transactions</AppText>
      </SecurityGate>,
    );

    expect(await screen.findByText('Authentication was cancelled.')).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Unlock' }));

    expect(await screen.findByText('Protected transactions')).toBeOnTheScreen();
    expect(authenticate).toHaveBeenCalledTimes(2);
  });

  it('shows a recoverable state when the native service fails', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation();
    const authenticator = makeAuthenticator({
      isAvailable: jest.fn(() => Promise.reject(new Error('native failure'))),
    });
    await render(
      <SecurityGate authenticator={authenticator}>
        <AppText>Protected transactions</AppText>
      </SecurityGate>,
    );

    expect(
      await screen.findByText('Device authentication is currently unavailable.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Unlock' })).toBeOnTheScreen();
    warning.mockRestore();
  });

  it('relocks and authenticates again after returning from the background', async () => {
    let appStateListener: ((state: AppStateStatus) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      appStateListener = listener;
      return { remove: jest.fn() } as NativeEventSubscription;
    });
    const authenticator = makeAuthenticator();
    await render(
      <SecurityGate authenticator={authenticator}>
        <AppText>Protected transactions</AppText>
      </SecurityGate>,
    );
    await screen.findByText('Protected transactions');

    await act(async () => appStateListener?.('background'));
    expect(await screen.findByText('Transactions locked')).toBeOnTheScreen();
    await act(async () => appStateListener?.('active'));

    await waitFor(() => expect(authenticator.authenticate).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Protected transactions')).toBeOnTheScreen();
  });
});
