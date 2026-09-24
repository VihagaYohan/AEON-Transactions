import { formatMoney, formatMoneyForSpeech } from '@/shared/lib/format';
import type { Money } from '@/shared/lib/money';
import { usePreferencesStore } from '@/shared/store/preferencesStore';
import { AppText, type AppTextProps } from '@/shared/ui/AppText';

interface AmountTextProps extends Omit<AppTextProps, 'children'> {
  money: Money;
  signed?: boolean;
}

/** Respects the hide-amounts preference visually and for screen-reader users. */
export const AmountText = ({ money, signed = true, tone, ...rest }: AmountTextProps) => {
  const hidden = usePreferencesStore((state) => state.hideAmounts);
  const positive = money.amountMinor > 0;

  return (
    <AppText
      accessibilityLabel={hidden ? 'Amount hidden' : formatMoneyForSpeech(money)}
      tone={tone ?? (positive && !hidden ? 'incoming' : 'default')}
      style={{ fontVariant: ['tabular-nums'] }}
      {...rest}
    >
      {hidden ? 'RM ••••' : formatMoney(money, { signed })}
    </AppText>
  );
};
