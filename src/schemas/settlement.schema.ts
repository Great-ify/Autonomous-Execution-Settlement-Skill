import { z } from 'zod';

export const SettlementSchema = z.object({
  agreementId: z.string().min(1),
  amount: z.number().positive(),
});

export type SettlementRequest = z.infer<typeof SettlementSchema>;
