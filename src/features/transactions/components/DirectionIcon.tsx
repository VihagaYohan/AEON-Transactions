import { View } from 'react-native';

import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui/AppText';

import type { Direction } from '../domain/transaction';

/** Decorative arrow; the parent row's accessible label states the direction in words. */
export const DirectionIcon = ({
  direction,
  size = 40,
}: {
  direction: Direction;
  size?: number;
}) => {
  const { colors } = useTheme();
  const incoming = direction === 'incoming';

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: incoming ? colors.incomingSurface : colors.outgoingSurface,
      }}
    >
      <AppText variant="heading" style={{ color: incoming ? colors.incoming : colors.outgoing }}>
        {incoming ? '↓' : '↑'}
      </AppText>
    </View>
  );
};
