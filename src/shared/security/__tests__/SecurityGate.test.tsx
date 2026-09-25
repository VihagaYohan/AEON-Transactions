/* eslint-disable testing-library/no-await-sync-events -- RNTL 14 fireEvent is asynchronous. */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

import { AppText } from '@/shared/ui';

import type { BiometricAuthenticator } from '../biometrics';
import { SecurityGate } from '../SecurityGate';

const makeAuthenticator = (
  overrides: Partial<BiometricAuthenticator> = {},
): BiometricAuthenticator => ({
  isAvailable: jest.fn(async () => true),
  availableMethods: jest.fn(async () => ['Fingerprint']),
  authenticate: jest.fn(async () => ({ success: true })),
  ...overrides,
});

async function setup(authenticator = makeAuthenticator()) {
  await render(
    <SecurityGate authenticator={authenticator}>
      <AppText>Protected transactions</AppText>
    </SecurityGate>,
  );
  await waitFor(() => expect(authenticator.availableMethods).toHaveBeenCalled());
  return authenticator;
}

async function passwordLogin(password = 'Aeon123!') {
  await fireEvent.changeText(screen.getByLabelText('Username'), 'aeon.demo');
  await fireEvent.changeText(screen.getByLabelText('Password'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
}

describe('SecurityGate', () => {
  afterEach(() => jest.restoreAllMocks());

  it('starts at login without prompting or mounting protected routes', async () => {
    const authenticator = await setup();
    expect(screen.getByText('Welcome back')).toBeOnTheScreen();
    expect(screen.queryByText('Protected transactions')).toBeNull();
    expect(authenticator.authenticate).not.toHaveBeenCalled();
  });

  it('rejects invalid credentials and accepts the demo account without biometrics', async () => {
    await setup(makeAuthenticator({ availableMethods: jest.fn(async () => []) }));
    expect(screen.queryByRole('button', { name: /Fingerprint/ })).toBeNull();
    await passwordLogin('wrong');
    expect(screen.getByRole('alert')).toHaveTextContent(/Incorrect username or password/);
    expect(screen.queryByText('Protected transactions')).toBeNull();
    await passwordLogin();
    expect(screen.getByText('Protected transactions')).toBeOnTheScreen();
  });

  it.each(['Fingerprint', 'Face ID'])('supports explicit %s sign-in', async (method) => {
    const authenticator = await setup(
      makeAuthenticator({ availableMethods: jest.fn(async () => [method]) }),
    );
    await fireEvent.press(await screen.findByRole('button', { name: `Sign in with ${method}` }));
    expect(await screen.findByText('Protected transactions')).toBeOnTheScreen();
    expect(authenticator.authenticate).toHaveBeenCalledTimes(1);
  });

  it('keeps content protected after cancellation and permits retry', async () => {
    const authenticate = jest
      .fn()
      .mockResolvedValueOnce({ success: false, error: 'user_cancel' })
      .mockResolvedValueOnce({ success: true });
    await setup(makeAuthenticator({ authenticate }));
    await fireEvent.press(await screen.findByRole('button', { name: /Fingerprint/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Authentication was cancelled/);
    expect(screen.queryByText('Protected transactions')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: /Fingerprint/ }));
    expect(await screen.findByText('Protected transactions')).toBeOnTheScreen();
  });

  it('allows password login when capability detection fails', async () => {
    await setup(
      makeAuthenticator({
        availableMethods: jest.fn(async () => {
          throw new Error('Unavailable');
        }),
      }),
    );
    await passwordLogin();
    expect(screen.getByText('Protected transactions')).toBeOnTheScreen();
  });

  it('allows password login after a native authentication error', async () => {
    await setup(
      makeAuthenticator({
        authenticate: jest.fn(async () => {
          throw new Error('Unavailable');
        }),
      }),
    );
    await fireEvent.press(await screen.findByRole('button', { name: /Fingerprint/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Use your password/);
    await passwordLogin();
    expect(screen.getByText('Protected transactions')).toBeOnTheScreen();
  });

  it('requires explicit sign-in again after backgrounding', async () => {
    let listener: ((state: AppStateStatus) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
      listener = callback;
      return { remove: jest.fn() } as NativeEventSubscription;
    });
    const authenticator = await setup();
    await passwordLogin();
    await act(async () => listener?.('background'));
    await act(async () => listener?.('active'));
    expect(screen.getByText('Welcome back')).toBeOnTheScreen();
    expect(screen.queryByText('Protected transactions')).toBeNull();
    expect(screen.getByLabelText('Password')).toHaveProp('value', '');
    expect(authenticator.authenticate).not.toHaveBeenCalled();
  });
});
