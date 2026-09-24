import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '../theme/useTheme';

// React 19 treats ref as a regular prop, so forwardRef is unnecessary.
export const Card = ({ ref, style, ...rest }: ViewProps & { ref?: Ref<View> }) => {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      ref={ref}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    />
  );
};
