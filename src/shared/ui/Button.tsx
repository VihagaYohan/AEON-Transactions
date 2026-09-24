import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const Button = ({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const { colors, radii, spacing } = useTheme();
  const primary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        {
          minHeight: 48,
          paddingHorizontal: spacing.lg,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: primary ? colors.accent : colors.surfaceMuted,
          opacity: isDisabled ? 0.6 : state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.onAccent : colors.text} />
      ) : (
        <AppText variant="heading" tone={primary ? 'onAccent' : 'default'}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
};
