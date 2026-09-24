import { View } from 'react-native';

import { useTheme } from '@/shared/theme/useTheme';
import { AppText } from '@/shared/ui/AppText';
import { Card } from '@/shared/ui/Card';

import type { CashFlow } from '../domain/operations';
import { AmountText } from './AmountText';

export const CashFlowSummary = ({ summary }: { summary: CashFlow }) => {
  const { spacing } = useTheme();

  return (
    <Card style={{ flexDirection: 'row', gap: spacing.lg }}>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <AppText variant="label" tone="muted">
          Money in
        </AppText>
        <AmountText money={summary.moneyIn} variant="heading" />
      </View>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <AppText variant="label" tone="muted">
          Money out
        </AppText>
        <AmountText money={summary.moneyOut} variant="heading" />
      </View>
    </Card>
  );
};
