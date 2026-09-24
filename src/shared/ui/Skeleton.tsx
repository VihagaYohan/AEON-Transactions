import { useEffect, useState } from 'react';
import { Animated, View, type DimensionValue } from 'react-native';

import { useTheme } from '../theme/useTheme';

export const SkeletonBlock = ({ width, height }: { width: DimensionValue; height: number }) => {
  const { colors, radii } = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius: radii.sm,
        backgroundColor: colors.surfaceMuted,
        opacity,
      }}
    />
  );
};

/** Placeholder rows match the real list layout so content does not jump after loading. */
export const SkeletonList = ({ rows = 6 }: { rows?: number }) => {
  const { spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel="Loading transactions"
      style={{ padding: spacing.lg, gap: spacing.lg }}
    >
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <SkeletonBlock width={40} height={40} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SkeletonBlock width="60%" height={14} />
            <SkeletonBlock width="35%" height={12} />
          </View>
          <SkeletonBlock width={80} height={16} />
        </View>
      ))}
    </View>
  );
};
