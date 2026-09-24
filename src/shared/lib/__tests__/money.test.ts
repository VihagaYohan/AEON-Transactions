import { money, sumMoney, toMinor } from '../money';

describe('toMinor', () => {
  it.each([
    [1500, 150000],
    [2300.75, 230075],
    [-500, -50000],
    [0.1 + 0.2, 30], // Floating-point noise must not leak into stored sen.
    [19.99, 1999],
  ])('converts %p to %p sen', (major, minor) => {
    expect(toMinor(major)).toBe(minor);
  });
});

describe('sumMoney', () => {
  it('adds in integer minor units without floating-point drift', () => {
    const items = Array.from({ length: 10 }, () => money(toMinor(0.1)));

    expect(sumMoney(items)).toEqual({ amountMinor: 100, currency: 'MYR' });
  });

  it('returns zero for an empty list', () => {
    expect(sumMoney([]).amountMinor).toBe(0);
  });
});
