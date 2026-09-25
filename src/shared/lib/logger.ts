/* eslint-disable no-console */
/**
 * PII-safe logger. It is silent in production builds and never prints payloads,
 * only a message and optional non-sensitive metadata such as codes, paths, or counts.
 */
type Meta = Record<string, string | number | boolean | undefined>;

const enabled = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

export const logger = {
  info(message: string, meta?: Meta) {
    if (enabled) console.info(`[info] ${message}`, meta ?? '');
  },
  warn(message: string, meta?: Meta) {
    if (enabled) console.warn(`[warn] ${message}`, meta ?? '');
  },
  error(message: string, meta?: Meta) {
    if (enabled) console.error(`[error] ${message}`, meta ?? '');
  },
};
