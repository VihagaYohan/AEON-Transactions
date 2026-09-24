import type { View } from 'react-native';

import { shareTransactionReceipt } from '../shareTransactionReceipt';

const view = {} as View;

const makeDependencies = () => ({
  canShare: jest.fn(() => Promise.resolve(true)),
  capture: jest.fn(() => Promise.resolve('/tmp/transaction-receipt.png')),
  share: jest.fn(() => Promise.resolve()),
  release: jest.fn(),
});

describe('shareTransactionReceipt', () => {
  it('captures, shares, and releases a temporary PNG', async () => {
    const dependencies = makeDependencies();

    await shareTransactionReceipt(view, dependencies);

    expect(dependencies.capture).toHaveBeenCalledWith(view);
    expect(dependencies.share).toHaveBeenCalledWith('file:///tmp/transaction-receipt.png');
    expect(dependencies.release).toHaveBeenCalledWith('/tmp/transaction-receipt.png');
  });

  it('does not duplicate an existing file URI scheme', async () => {
    const dependencies = makeDependencies();
    dependencies.capture.mockResolvedValueOnce('file:///tmp/receipt.png');

    await shareTransactionReceipt(view, dependencies);

    expect(dependencies.share).toHaveBeenCalledWith('file:///tmp/receipt.png');
  });

  it('fails before capture when native sharing is unavailable', async () => {
    const dependencies = makeDependencies();
    dependencies.canShare.mockResolvedValueOnce(false);

    await expect(shareTransactionReceipt(view, dependencies)).rejects.toThrow(
      'File sharing is unavailable on this device',
    );
    expect(dependencies.capture).not.toHaveBeenCalled();
  });

  it('releases the temporary image when sharing fails', async () => {
    const dependencies = makeDependencies();
    dependencies.share.mockRejectedValueOnce(new Error('share failed'));

    await expect(shareTransactionReceipt(view, dependencies)).rejects.toThrow('share failed');
    expect(dependencies.release).toHaveBeenCalledWith('/tmp/transaction-receipt.png');
  });

  it('does not release a file when capture fails', async () => {
    const dependencies = makeDependencies();
    dependencies.capture.mockRejectedValueOnce(new Error('capture failed'));

    await expect(shareTransactionReceipt(view, dependencies)).rejects.toThrow('capture failed');
    expect(dependencies.release).not.toHaveBeenCalled();
  });
});
