import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import {
  AppState,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '@/shared/theme/useTheme';
import { AppText, Button, Screen } from '@/shared/ui';

import { deviceBiometricAuthenticator, type BiometricAuthenticator } from './biometrics';

interface SecurityGateProps extends PropsWithChildren {
  authenticator?: BiometricAuthenticator;
}

/** Demo only: never use client-side credentials as production authentication. */
export const DEMO_CREDENTIALS = { username: 'aeon.demo', password: 'Aeon123!' } as const;

/** All routes remain unmounted until the user explicitly signs in. */
export const SecurityGate = ({
  children,
  authenticator = deviceBiometricAuthenticator,
}: SecurityGateProps) => {
  const { colors, spacing, radii } = useTheme();
  const [unlocked, setUnlocked] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [methods, setMethods] = useState<string[]>([]);
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const authenticating = useRef(false);
  const mounted = useRef(true);
  const passwordInput = useRef<TextInput>(null);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    const discover = async () => {
      try {
        const supported = await authenticator.availableMethods();
        if (active) setMethods(supported);
      } catch {
        if (active) setMethods([]);
      }
    };
    void discover();
    const subscription = AppState.addEventListener('change', (state) => {
      // Native biometric prompts can temporarily change app state.
      if (state === 'background' && !authenticating.current) {
        setUnlocked(false);
        setPassword('');
        setMessage(undefined);
      }
      if (state === 'active') void discover();
    });
    return () => {
      active = false;
      mounted.current = false;
      subscription.remove();
    };
  }, [authenticator]);

  const signIn = () => {
    if (authenticating.current) return;
    if (username.trim() !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
      setMessage('Incorrect username or password. Try the demo credentials below.');
      return;
    }
    setMessage(undefined);
    setPassword('');
    setUnlocked(true);
  };

  const signInWithBiometrics = async () => {
    if (authenticating.current) return;
    authenticating.current = true;
    setBusy(true);
    setMessage(undefined);
    try {
      const result = await authenticator.authenticate();
      if (!mounted.current || AppState.currentState === 'background') return;
      if (result.success) {
        setPassword('');
        setUnlocked(true);
      } else {
        setMessage(
          result.error?.includes('cancel')
            ? 'Authentication was cancelled. Try again or use your password.'
            : 'Biometric sign-in failed. Try again or use your password.',
        );
      }
    } catch {
      if (mounted.current) setMessage('Biometric sign-in is unavailable. Use your password.');
    } finally {
      authenticating.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  if (unlocked) return children;

  const inputStyle = {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 16,
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}
        >
          <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center', gap: spacing.xl }}>
            <View style={{ gap: spacing.sm }}>
              <Image
                source={require('../../../assets/images/icon.png')}
                accessibilityLabel="AEON app logo"
                style={{ width: 76, height: 76, borderRadius: radii.lg, marginBottom: spacing.lg }}
              />
              <AppText variant="label" tone="accent">
                AEON · EVERYDAY BANKING
              </AppText>
              <AppText variant="display" accessibilityRole="header">
                Welcome back
              </AppText>
              <AppText tone="muted">Sign in to see your transactions.</AppText>
            </View>
            <View style={{ gap: spacing.md }}>
              <AppText variant="label">Username</AppText>
              <TextInput
                accessibilityLabel="Username"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                autoComplete="username"
                placeholder="Enter your username"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                editable={!busy}
                returnKeyType="next"
                onSubmitEditing={() => passwordInput.current?.focus()}
                style={inputStyle}
              />
              <AppText variant="label">Password</AppText>
              <TextInput
                ref={passwordInput}
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                editable={!busy}
                returnKeyType="go"
                onSubmitEditing={signIn}
                style={inputStyle}
              />
              {message ? (
                <AppText accessibilityRole="alert" style={{ color: colors.danger }}>
                  {message}
                </AppText>
              ) : null}
              <Button
                label="Sign in"
                onPress={signIn}
                disabled={busy || !username.trim() || !password}
              />
              {methods.length > 0 ? (
                <Button
                  label={`Sign in with ${methods.join(' or ')}`}
                  variant="secondary"
                  loading={busy}
                  onPress={() => void signInWithBiometrics()}
                />
              ) : null}
            </View>
            <View
              style={{
                padding: spacing.lg,
                borderRadius: radii.md,
                backgroundColor: colors.surfaceMuted,
                gap: spacing.xs,
              }}
            >
              <AppText variant="label">Try the demo</AppText>
              <AppText tone="muted">Username: {DEMO_CREDENTIALS.username}</AppText>
              <AppText tone="muted">Password: {DEMO_CREDENTIALS.password}</AppText>
              <AppText variant="caption" tone="muted">
                Sample account only. No real banking data.
              </AppText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};
