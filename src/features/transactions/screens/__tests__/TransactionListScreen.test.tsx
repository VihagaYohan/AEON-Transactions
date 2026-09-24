import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { NetworkError } from '@/shared/lib/errors';
import { initialPreferences, usePreferencesStore } from '@/shared/store/preferencesStore';
import { renderWithProviders } from '@/test/render';

import { MockTransactionRepository } from '../../data/mockTransactionRepository';
import { TransactionListScreen } from '../TransactionListScreen';

describe('TransactionListScreen', () => {
  beforeEach(() => usePreferencesStore.setState(initialPreferences));

  it('shows a skeleton, then transactions newest first with month headers', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 50 });
    await renderWithProviders(<TransactionListScreen onOpenTransaction={jest.fn()} />, {
      repository,
    });

    expect(screen.getByLabelText('Loading transactions')).toBeOnTheScreen();

    const rows = await screen.findAllByRole('button', { name: /payment|refund/i });
    expect(rows.map((row) => row.props.accessibilityLabel.split(',')[0])).toEqual([
      'Salary Payment',
      'Refund',
      'Invoice Payment',
      'Bonus Payment',
    ]);
    expect(screen.getByText('October 2024')).toBeOnTheScreen();
    expect(screen.getByText('September 2024')).toBeOnTheScreen();
  });

  it('opens a transaction with its refId', async () => {
    const onOpen = jest.fn();
    await renderWithProviders(<TransactionListScreen onOpenTransaction={onOpen} />);

    await userEvent.setup().press(await screen.findByRole('button', { name: /^refund/i }));

    expect(onOpen).toHaveBeenCalledWith('789GHI');
  });

  it('shows money in and out totals', async () => {
    await renderWithProviders(<TransactionListScreen onOpenTransaction={jest.fn()} />);
    await screen.findByText('Money in');

    expect(screen.getByText('+RM 5,000.75')).toBeOnTheScreen();
    expect(screen.getAllByText('\u2212RM 500.00')).toHaveLength(2);
  });

  it('recovers from an error when the user retries', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0 });
    const realList = repository.list.bind(repository);
    const list = jest
      .spyOn(repository, 'list')
      .mockRejectedValueOnce(new NetworkError())
      .mockImplementation(realList);

    await renderWithProviders(<TransactionListScreen onOpenTransaction={jest.fn()} />, {
      repository,
    });

    expect(
      await screen.findByRole('alert', { name: "Couldn't load transactions" }),
    ).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('button', { name: /salary payment/i })).toBeOnTheScreen();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('shows an empty state when there are no transactions', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0, payload: { data: [] } });
    await renderWithProviders(<TransactionListScreen onOpenTransaction={jest.fn()} />, {
      repository,
    });

    expect(await screen.findByText('No transactions yet')).toBeOnTheScreen();
  });

  it('hides every amount when the user toggles privacy mode', async () => {
    await renderWithProviders(<TransactionListScreen onOpenTransaction={jest.fn()} />);
    await screen.findByText('Money in');

    await userEvent.setup().press(screen.getByRole('switch', { name: 'Hide amounts' }));
    await waitFor(() => expect(screen.queryByText('+RM 1,500.00')).not.toBeOnTheScreen());

    expect(screen.getAllByText('RM ••••').length).toBeGreaterThan(0);
  });
});
