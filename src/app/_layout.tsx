import { QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { env } from '@/config/env';
import { createQueryClient, useAppStateFocus } from '@/config/queryClient';
import {
  MockTransactionRepository,
  OfflineTransactionRepository,
  TransactionRepositoryProvider,
} from '@/features/transactions';
import { PrivacyProtection, SecurityGate } from '@/shared/security';
import { useTheme } from '@/shared/theme/useTheme';

export default function RootLayout() {
  // Instance-local dependencies keep test and application lifecycles isolated.
  const [queryClient] = useState(createQueryClient);
  const [repository] = useState(
    () =>
      new OfflineTransactionRepository(
        new MockTransactionRepository({
          latencyMs: env.mockLatencyMs,
          failRate: env.mockFailRate,
        }),
        AsyncStorage,
      ),
  );
  const { colors, scheme } = useTheme();
  useAppStateFocus();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <TransactionRepositoryProvider repository={repository}>
          <PrivacyProtection>
            <SecurityGate>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.accent,
                  headerTitleStyle: { color: colors.text },
                  contentStyle: { backgroundColor: colors.background },
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{ headerShown: false, title: 'Transactions' }}
                />
                <Stack.Screen
                  name="transactions/[refId]"
                  options={{ title: 'Transaction details' }}
                />
              </Stack>
            </SecurityGate>
          </PrivacyProtection>
        </TransactionRepositoryProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
