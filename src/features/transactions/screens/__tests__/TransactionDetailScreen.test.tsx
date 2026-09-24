import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { NetworkError } from '@/shared/lib/errors';
import { initialPreferences, usePreferencesStore } from '@/shared/store/preferencesStore';
import { renderWithProviders } from '@/test/render';

import { MockTransactionRepository } from '../../data/mockTransactionRepository';
import { TransactionDetailScreen } from '../TransactionDetailScreen';

const defaultProps = {
  refId: '123ABC',
  onCopyReference: jest.fn(() => Promise.resolve()),
  onShare: jest.fn(() => Promise.resolve()),
  onGoBack: jest.fn(),
};

describe('TransactionDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePreferencesStore.setState(initialPreferences);
  });

  it('shows the complete transaction details', async () => {
    await renderWithProviders(<TransactionDetailScreen {...defaultProps} />);

    expect(await screen.findByText('+RM 1,500.00')).toBeOnTheScreen();
    expect(screen.getByText('Salary Payment')).toBeOnTheScreen();
    expect(screen.getByLabelText('From, John Doe')).toBeOnTheScreen();
    expect(screen.getByText('15 Oct 2024, 8:34 pm')).toBeOnTheScreen();
    expect(screen.getByTestId('reference-id')).toHaveTextContent('123ABC');
  });

  it('copies the reference and confirms the action', async () => {
    const onCopyReference = jest.fn(() => Promise.resolve());
    await renderWithProviders(
      <TransactionDetailScreen {...defaultProps} onCopyReference={onCopyReference} />,
    );

    await userEvent.setup().press(await screen.findByRole('button', { name: 'Copy reference' }));

    await waitFor(() => expect(onCopyReference).toHaveBeenCalledWith('123ABC'));
    expect(screen.getByRole('button', { name: 'Reference copied' })).toBeOnTheScreen();
  });

  it('shares the loaded transaction', async () => {
    const onShare = jest.fn(() => Promise.resolve());
    await renderWithProviders(<TransactionDetailScreen {...defaultProps} onShare={onShare} />);

    await userEvent.setup().press(await screen.findByRole('button', { name: 'Share transaction' }));

    expect(onShare).toHaveBeenCalledWith(expect.objectContaining({ refId: '123ABC' }));
  });

  it('does not expose transaction data through sharing when amounts are hidden', async () => {
    usePreferencesStore.setState({ hideAmounts: true });
    await renderWithProviders(<TransactionDetailScreen {...defaultProps} />);

    expect(await screen.findByText('RM ••••')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Share transaction' })).toBeDisabled();
    expect(screen.getByText(/show amounts on the transaction list/i)).toBeOnTheScreen();
  });

  it('rejects an invalid reference without querying the repository', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0 });
    const getById = jest.spyOn(repository, 'getById');
    await renderWithProviders(<TransactionDetailScreen {...defaultProps} refId="not-valid" />, {
      repository,
    });

    expect(screen.getByText('Invalid transaction link')).toBeOnTheScreen();
    expect(getById).not.toHaveBeenCalled();
  });

  it('shows a not-found state for a valid but unknown reference', async () => {
    await renderWithProviders(<TransactionDetailScreen {...defaultProps} refId="UNKNOWN" />);

    expect(await screen.findByText('Transaction not found')).toBeOnTheScreen();
  });

  it('recovers after retrying a failed request', async () => {
    const repository = new MockTransactionRepository({ latencyMs: 0 });
    const realGetById = repository.getById.bind(repository);
    jest
      .spyOn(repository, 'getById')
      .mockRejectedValueOnce(new NetworkError())
      .mockImplementation(realGetById);

    await renderWithProviders(<TransactionDetailScreen {...defaultProps} />, { repository });

    expect(
      await screen.findByRole('alert', { name: "Couldn't load transaction" }),
    ).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Salary Payment')).toBeOnTheScreen();
  });
});
