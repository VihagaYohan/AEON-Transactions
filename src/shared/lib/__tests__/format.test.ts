import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatMoneyForSpeech,
  formatMonthYear,
} from '../format';
import { money } from '../money';

// The npm test scripts pin the time zone to Asia/Kuala_Lumpur (UTC+8).
const utc = new Date('2024-10-15T12:34:56Z');

describe('formatMoney', () => {
  it('formats MYR with two decimals', () => {
    expect(formatMoney(money(150000))).toBe('RM 1,500.00');
  });

  it('keeps a minus sign for negative amounts when unsigned', () => {
    expect(formatMoney(money(-50000))).toBe('-RM 500.00');
  });

  it('adds explicit signs when signed', () => {
    expect(formatMoney(money(230075), { signed: true })).toBe('+RM 2,300.75');
    expect(formatMoney(money(-50000), { signed: true })).toBe('−RM 500.00');
    expect(formatMoney(money(0), { signed: true })).toBe('RM 0.00');
  });
});

describe('date formatting', () => {
  it('renders UTC timestamps in local time', () => {
    // 12:34 UTC is 8:34 pm in Kuala Lumpur.
    expect(formatDateTime(utc, 'en-MY')).toMatch(/15 Oct 2024.*8:34\s?pm/i);
  });

  it('formats the date only', () => {
    expect(formatDate(utc, 'en-MY')).toBe('15 Oct 2024');
  });

  it('formats month section headers', () => {
    expect(formatMonthYear(utc, 'en-MY')).toBe('October 2024');
  });
});

describe('formatMoneyForSpeech', () => {
  it('reads amounts without the currency symbol', () => {
    expect(formatMoneyForSpeech(money(-50000))).toBe('500.00 ringgit');
  });
});
