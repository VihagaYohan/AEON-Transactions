import { View } from 'react-native';

import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui';

interface DetailFieldProps {
  label: string;
  value: string;
  testID?: string;
}

/** A consistently labelled value for transaction metadata. */
export const DetailField = ({ label, value, testID }: DetailFieldProps) => {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.xs }} accessible accessibilityLabel={`${label}, ${value}`}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <AppText testID={testID} selectable>
        {value}
      </AppText>
    </View>
  );
};
