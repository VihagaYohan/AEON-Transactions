import { getDeviceLocale } from './locale';
import type { Money } from './money';

// Formatters are expensive to create, so they are cached per locale and options.
const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

const decimalFormatter = (locale: string): Intl.NumberFormat => {
  let formatter = numberFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    numberFormatters.set(locale, formatter);
  }
  return formatter;
};

const dateTimeFormatter = (
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = dateTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatters.set(key, formatter);
  }
  return formatter;
};

const CURRENCY_SYMBOL: Record<Money['currency'], string> = { MYR: 'RM' };

interface MoneyFormatOptions {
  /** Prefix "+" for positive amounts and "−" for negative ones. */
  signed?: boolean;
  locale?: string;
}

/**
 * Formats minor units as "RM 1,500.00". The symbol and sign are added manually
 * because ICU currency output differs between Hermes on iOS, Android, and Node.
 */
export const formatMoney = (
  { amountMinor, currency }: Money,
  { signed = false, locale = getDeviceLocale() }: MoneyFormatOptions = {},
): string => {
  const body = `${CURRENCY_SYMBOL[currency]} ${decimalFormatter(locale).format(Math.abs(amountMinor) / 100)}`;
  if (amountMinor < 0) return `${signed ? '−' : '-'}${body}`;
  if (signed && amountMinor > 0) return `+${body}`;
  return body;
};

/** e.g. "15 Oct 2024, 8:34 pm" in the device locale and time zone. */
export const formatDateTime = (date: Date, locale: string = getDeviceLocale()): string =>
  dateTimeFormatter(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

/** e.g. "15 Oct 2024". */
export const formatDate = (date: Date, locale: string = getDeviceLocale()): string =>
  dateTimeFormatter(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

/** e.g. "October 2024" for section headers. */
export const formatMonthYear = (date: Date, locale: string = getDeviceLocale()): string =>
  dateTimeFormatter(locale, { month: 'long', year: 'numeric' }).format(date);

/** Spoken form for screen readers, e.g. "1,500.00 ringgit". */
export const formatMoneyForSpeech = (
  { amountMinor }: Money,
  locale: string = getDeviceLocale(),
): string => `${decimalFormatter(locale).format(Math.abs(amountMinor) / 100)} ringgit`;
