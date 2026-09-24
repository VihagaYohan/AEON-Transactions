import { Pressable } from 'react-native';

import { usePreferencesStore } from '@/shared/store/preferencesStore';
import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui/AppText';

export const HideAmountsToggle = () => {
  const { spacing } = useTheme();
  const hidden = usePreferencesStore((state) => state.hideAmounts);
  const toggle = usePreferencesStore((state) => state.toggleHideAmounts);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Hide amounts"
      accessibilityState={{ checked: hidden }}
      hitSlop={12}
      onPress={toggle}
      style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm }}
    >
      <AppText variant="label" tone="accent">
        {hidden ? 'Show amounts' : 'Hide amounts'}
      </AppText>
    </Pressable>
  );
};
