export const transactionKeys = {
  all: ['transactions'] as const,
  detail: (refId: string) => ['transactions', 'detail', refId] as const,
};
