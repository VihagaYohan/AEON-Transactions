import { Text, type TextProps } from 'react-native';

import { useTheme } from '../theme/useTheme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
type Tone = 'default' | 'muted' | 'accent' | 'incoming' | 'danger' | 'onAccent';

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
}

/** Text that follows the theme and scales with the OS font size without fixed heights. */
export const AppText = ({ variant = 'body', tone = 'default', style, ...rest }: AppTextProps) => {
  const { colors, typography } = useTheme();
  const color = {
    default: colors.text,
    muted: colors.textMuted,
    accent: colors.accent,
    incoming: colors.incoming,
    danger: colors.danger,
    onAccent: colors.onAccent,
  }[tone];

  return (
    <Text maxFontSizeMultiplier={2} style={[typography[variant], { color }, style]} {...rest} />
  );
};
