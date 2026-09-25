import { act, renderHook } from '@testing-library/react-native';

import { useTransientFlag } from '../useTransientFlag';

describe('useTransientFlag', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('activates immediately and resets after the configured duration', async () => {
    const { result } = await renderHook(() => useTransientFlag(500));

    await act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    await act(() => jest.advanceTimersByTime(500));
    expect(result.current[0]).toBe(false);
  });

  it('restarts the timer and clears it when unmounted', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { result, unmount } = await renderHook(() => useTransientFlag(500));

    await act(() => result.current[1]());
    await act(() => result.current[1]());
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
