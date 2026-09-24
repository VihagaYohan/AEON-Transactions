import { focusManager, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { isRetryable } from '@/shared/lib/errors';

const MAX_RETRIES = 2;

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A broken contract will not fix itself; only transient failures are retried.
        retry: (failureCount, error) => isRetryable(error) && failureCount < MAX_RETRIES,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
    },
  });

/** React Native has no window focus, so stale queries refetch when the app returns. */
export const useAppStateFocus = (): void => {
  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
    };
    const subscription = AppState.addEventListener('change', onChange);

    return () => subscription.remove();
  }, []);
};
