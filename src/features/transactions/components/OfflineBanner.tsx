import { View } from 'react-native';

import { formatDateTime } from '@/shared/lib/format';
import { useDataFreshnessStore } from '@/shared/store/dataFreshnessStore';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui';

export const OfflineBanner = () => {
  const { colors, spacing } = useTheme();
  const source = useDataFreshnessStore((state) => state.source);
  const cachedAt = useDataFreshnessStore((state) => state.cachedAt);

  if (source !== 'cache' || !cachedAt) return null;

  return (
    <View
      accessibilityRole="alert"
      testID="offline-banner"
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surfaceMuted,
      }}
    >
      <AppText variant="caption" tone="muted" style={{ textAlign: 'center' }}>
        Offline · Showing transactions saved {formatDateTime(cachedAt)}
      </AppText>
    </View>
  );
};
