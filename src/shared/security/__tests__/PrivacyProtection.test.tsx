import { act, render } from '@testing-library/react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { Text } from 'react-native';

import { PrivacyProtection } from '../PrivacyProtection';

jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn(() => Promise.resolve()),
  allowScreenCaptureAsync: jest.fn(() => Promise.resolve()),
  enableAppSwitcherProtectionAsync: jest.fn(() => Promise.resolve()),
  disableAppSwitcherProtectionAsync: jest.fn(() => Promise.resolve()),
}));

describe('PrivacyProtection', () => {
  it('blocks screen capture while protected content is mounted', async () => {
    const view = await render(
      <PrivacyProtection>
        <Text>Private content</Text>
      </PrivacyProtection>,
    );

    expect(ScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledWith('transaction-privacy');

    await act(async () => view.unmount());
    expect(ScreenCapture.allowScreenCaptureAsync).toHaveBeenCalledWith('transaction-privacy');
  });
});
