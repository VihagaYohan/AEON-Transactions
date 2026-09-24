import { makeTransaction } from '@/test/factories';

import { buildShareMessage, counterpartyLabel, describeTransaction } from '../describe';

const salary = makeTransaction({ refId: '123ABC', amountMinor: 150000 });
const refund = makeTransaction({
  refId: '789GHI',
  name: 'Refund',
  counterparty: 'Robert Brown',
  amountMinor: -50000,
  date: new Date('2024-10-05T16:18:30Z'),
});

describe('describeTransaction', () => {
  it('builds a spoken label that states direction in words', () => {
    expect(describeTransaction(salary, false)).toBe(
      'Salary Payment, received 1,500.00 ringgit, 15 Oct 2024',
    );
    expect(describeTransaction(refund, false)).toBe('Refund, sent 500.00 ringgit, 6 Oct 2024');
  });

  it('never reads the amount when amounts are hidden', () => {
    expect(describeTransaction(salary, true)).toBe(
      'Salary Payment, received amount hidden, 15 Oct 2024',
    );
  });
});

describe('counterpartyLabel', () => {
  it('uses From for incoming and To for outgoing', () => {
    expect(counterpartyLabel(salary)).toBe('From');
    expect(counterpartyLabel(refund)).toBe('To');
  });
});

describe('buildShareMessage', () => {
  it('contains exactly the fields shown on the detail screen', () => {
    expect(buildShareMessage(refund)).toBe(
      [
        'Transfer details',
        'Reference ID: 789GHI',
        'Date: 6 Oct 2024, 12:18 am',
        'To: Robert Brown',
        'Amount: −RM 500.00',
        'Description: Refund',
      ].join('\n'),
    );
  });
});
