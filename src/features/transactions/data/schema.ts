import { z } from 'zod';

/** Runtime contract for GET /transactions from the assessment brief. */
export const TransactionDtoSchema = z.object({
  refId: z.string().min(1),
  transferDate: z.iso.datetime(), // UTC ISO-8601, e.g. 2024-10-15T12:34:56Z.
  recipientName: z.string().min(1),
  transferName: z.string().min(1),
  amount: z.number(),
});

export const TransactionsResponseSchema = z.object({
  data: z.array(TransactionDtoSchema),
});

export type TransactionDto = z.infer<typeof TransactionDtoSchema>;
export type TransactionsResponse = z.infer<typeof TransactionsResponseSchema>;
