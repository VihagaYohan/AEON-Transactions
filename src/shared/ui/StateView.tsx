import { View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Button } from './Button';

interface StateViewProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'default' | 'danger';
}

/** Shared empty, error, and not-found view. */
export const StateView = ({ title, message, actionLabel, onAction, tone }: StateViewProps) => {
  const { spacing } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        gap: spacing.md,
      }}
    >
      <AppText
        variant="title"
        accessibilityRole={tone === 'danger' ? 'alert' : 'header'}
        tone={tone === 'danger' ? 'danger' : 'default'}
        style={{ textAlign: 'center' }}
      >
        {title}
      </AppText>
      {message ? (
        <AppText tone="muted" style={{ textAlign: 'center' }}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
};
