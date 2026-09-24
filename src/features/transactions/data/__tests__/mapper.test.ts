import { DataContractError } from '@/shared/lib/errors';
import { logger } from '@/shared/lib/logger';

import sample from '../__fixtures__/transactions.json';
import { parseTransactionsResponse, toTransaction } from '../mapper';

describe('toTransaction', () => {
  it('maps the DTO to a domain entity with money in minor units', () => {
    const transaction = toTransaction({
      refId: '456DEF',
      transferDate: '2024-09-21T09:12:45Z',
      recipientName: 'Jane Smith',
      transferName: 'Invoice Payment',
      amount: 2300.75,
    });

    expect(transaction).toEqual({
      refId: '456DEF',
      name: 'Invoice Payment',
      counterparty: 'Jane Smith',
      date: new Date('2024-09-21T09:12:45Z'),
      money: { amountMinor: 230075, currency: 'MYR' },
      direction: 'incoming',
    });
  });

  it('treats a negative refund as outgoing', () => {
    const transaction = toTransaction({
      refId: '789GHI',
      transferDate: '2024-10-05T16:18:30Z',
      recipientName: 'Robert Brown',
      transferName: 'Refund',
      amount: -500,
    });

    expect(transaction.direction).toBe('outgoing');
    expect(transaction.money.amountMinor).toBe(-50000);
  });
});

describe('parseTransactionsResponse', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('accepts the sample response from the brief', () => {
    expect(parseTransactionsResponse(sample)).toHaveLength(4);
  });

  it.each([
    ['missing data', {}],
    ['bad date', { data: [{ ...sample.data[0], transferDate: '15/10/2024' }] }],
    ['amount as string', { data: [{ ...sample.data[0], amount: '1500.00' }] }],
    ['empty refId', { data: [{ ...sample.data[0], refId: '' }] }],
  ])('rejects %s with a DataContractError', (_label, payload) => {
    expect(() => parseTransactionsResponse(payload)).toThrow(DataContractError);
  });

  it('reports failing paths, not payload values', () => {
    try {
      parseTransactionsResponse({ data: [{ ...sample.data[0], amount: 'x' }] });
    } catch (error) {
      expect((error as DataContractError).issuePaths).toEqual(['data.0.amount']);
    }
    expect.assertions(1);
  });

  it('logs failing paths without logging PII from the payload', () => {
    expect(() =>
      parseTransactionsResponse({ data: [{ ...sample.data[0], amount: 'x' }] }),
    ).toThrow();
    expect(logger.warn).toHaveBeenCalledWith(expect.any(String), { paths: 'data.0.amount' });
    expect(JSON.stringify(jest.mocked(logger.warn).mock.calls)).not.toContain('John Doe');
  });
});
