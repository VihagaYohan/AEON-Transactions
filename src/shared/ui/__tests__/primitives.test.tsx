import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppText } from '../AppText';
import { Button } from '../Button';
import { Card } from '../Card';
import { Screen } from '../Screen';
import { SkeletonList } from '../Skeleton';
import { StateView } from '../StateView';

describe('shared UI primitives', () => {
  it('renders scalable themed text', async () => {
    await render(<AppText variant="title">Transactions</AppText>);

    expect(screen.getByText('Transactions')).toHaveProp('maxFontSizeMultiplier', 2);
  });

  it('runs enabled button actions', async () => {
    const onPress = jest.fn();
    await render(<Button label="Retry" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes disabled button state', async () => {
    await render(<Button label="Retry" disabled />);

    expect(screen.getByRole('button', { name: 'Retry' })).toHaveProp('accessibilityState', {
      disabled: true,
      busy: false,
    });
  });

  it('shows a busy state while a button is loading', async () => {
    await render(<Button label="Share" loading />);

    expect(screen.getByRole('button')).toHaveProp('accessibilityState', {
      disabled: true,
      busy: true,
    });
    expect(screen.queryByText('Share')).not.toBeOnTheScreen();
  });

  it('renders card and screen content', async () => {
    await render(
      <Screen>
        <Card>
          <Text>Content</Text>
        </Card>
      </Screen>,
    );

    expect(screen.getByText('Content')).toBeOnTheScreen();
  });

  it('keeps error actions separately reachable', async () => {
    const onAction = jest.fn();
    await render(
      <StateView
        title="Unable to load"
        message="Check your connection"
        actionLabel="Retry"
        onAction={onAction}
        tone="danger"
      />,
    );

    expect(screen.getByRole('alert', { name: 'Unable to load' })).toBeOnTheScreen();
    expect(screen.getByText('Check your connection')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('supports state views without optional content', async () => {
    await render(<StateView title="No transactions" />);

    expect(screen.getByRole('header', { name: 'No transactions' })).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('announces skeleton rows as one loading region', async () => {
    const view = await render(<SkeletonList rows={2} />);

    expect(screen.getByLabelText('Loading transactions')).toBeOnTheScreen();
    view.unmount();
  });
});
