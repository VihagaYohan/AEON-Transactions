import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '../theme/useTheme';

export const Screen = ({
  children,
  edges = ['top', 'left', 'right'],
}: PropsWithChildren<{ edges?: Edge[] }>) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
};
