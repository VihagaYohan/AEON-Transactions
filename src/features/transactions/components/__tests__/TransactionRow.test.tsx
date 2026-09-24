import { render, screen, userEvent } from '@testing-library/react-native';

import { initialPreferences, usePreferencesStore } from '@/shared/store/preferencesStore';
import { makeTransaction } from '@/test/factories';

import { TransactionRow } from '../TransactionRow';

const salary = makeTransaction({ refId: '123ABC', amountMinor: 150000 });
const refund = makeTransaction({ refId: '789GHI', name: 'Refund', amountMinor: -50000 });

describe('TransactionRow', () => {
  beforeEach(() => usePreferencesStore.setState(initialPreferences));

  it('shows name, local date, and a signed amount', async () => {
    await render(<TransactionRow transaction={salary} onPress={jest.fn()} />);

    expect(screen.getByText('Salary Payment')).toBeOnTheScreen();
    expect(screen.getByText(/15 Oct 2024/)).toBeOnTheScreen();
    expect(screen.getByText('+RM 1,500.00')).toBeOnTheScreen();
  });

  it('marks outgoing amounts with a minus sign instead of relying on colour', async () => {
    await render(<TransactionRow transaction={refund} onPress={jest.fn()} />);

    expect(screen.getByText('\u2212RM 500.00')).toBeOnTheScreen();
  });

  it('exposes one accessible button with a descriptive label', async () => {
    const onPress = jest.fn();
    await render(<TransactionRow transaction={salary} onPress={onPress} />);

    const row = screen.getByRole('button', {
      name: /salary payment, received 1,500.00 ringgit/i,
    });
    await userEvent.setup().press(row);

    expect(onPress).toHaveBeenCalledWith('123ABC');
  });

  it('hides the amount visually and for screen readers', async () => {
    usePreferencesStore.setState({ hideAmounts: true });
    await render(<TransactionRow transaction={salary} onPress={jest.fn()} />);

    expect(screen.queryByText('+RM 1,500.00')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /amount hidden/i })).toBeOnTheScreen();
  });
});
