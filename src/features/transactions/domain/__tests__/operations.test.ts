import { makeTransaction } from '@/test/factories';

import { groupByMonth, sortNewestFirst, summarise } from '../operations';
import { directionOf, isValidRefId } from '../transaction';

describe('directionOf', () => {
  it('treats negative amounts as outgoing and the rest as incoming', () => {
    expect(directionOf(-1)).toBe('outgoing');
    expect(directionOf(0)).toBe('incoming');
    expect(directionOf(150000)).toBe('incoming');
  });
});

describe('isValidRefId', () => {
  it.each(['123ABC', '101JKL', 'A'])('accepts %p', (id) => {
    expect(isValidRefId(id)).toBe(true);
  });

  it.each(['', 'abc', '../etc', '123 ABC', 'X'.repeat(21), undefined, 42])('rejects %p', (id) => {
    expect(isValidRefId(id)).toBe(false);
  });
});

describe('sortNewestFirst', () => {
  it('orders by date descending without mutating the input', () => {
    const oldest = makeTransaction({ date: new Date('2024-08-30T11:47:22Z') });
    const newest = makeTransaction({ date: new Date('2024-10-15T12:34:56Z') });
    const middle = makeTransaction({ date: new Date('2024-10-05T16:18:30Z') });
    const input = [oldest, newest, middle];

    expect(sortNewestFirst(input)).toEqual([newest, middle, oldest]);
    expect(input).toEqual([oldest, newest, middle]);
  });
});

describe('groupByMonth', () => {
  it('groups consecutive transactions by local calendar month', () => {
    const oct15 = makeTransaction({ date: new Date('2024-10-15T12:34:56Z') });
    const oct05 = makeTransaction({ date: new Date('2024-10-05T16:18:30Z') });
    const sep21 = makeTransaction({ date: new Date('2024-09-21T09:12:45Z') });

    const sections = groupByMonth([oct15, oct05, sep21]);

    expect(sections.map((section) => section.key)).toEqual(['2024-10', '2024-09']);
    expect(sections[0]?.transactions).toEqual([oct15, oct05]);
  });

  it('uses local time at month boundaries', () => {
    // 30 Sep 20:00 UTC is 1 Oct 04:00 in Kuala Lumpur.
    const transaction = makeTransaction({ date: new Date('2024-09-30T20:00:00Z') });

    expect(groupByMonth([transaction])[0]?.key).toBe('2024-10');
  });

  it('returns no sections for no transactions', () => {
    expect(groupByMonth([])).toEqual([]);
  });
});

describe('summarise', () => {
  it('totals money in and out in minor units', () => {
    const summary = summarise([
      makeTransaction({ amountMinor: 150000 }),
      makeTransaction({ amountMinor: 230075 }),
      makeTransaction({ amountMinor: -50000 }),
    ]);

    expect(summary.moneyIn.amountMinor).toBe(380075);
    expect(summary.moneyOut.amountMinor).toBe(-50000);
    expect(summary.net.amountMinor).toBe(330075);
  });
});
