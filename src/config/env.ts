/** Non-secret runtime flags. EXPO_PUBLIC_* values are inlined at build time. */
const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return value !== undefined && Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  mockLatencyMs: toNumber(process.env.EXPO_PUBLIC_MOCK_LATENCY_MS, 600),
  mockFailRate: toNumber(process.env.EXPO_PUBLIC_MOCK_FAIL_RATE, 0),
} as const;
