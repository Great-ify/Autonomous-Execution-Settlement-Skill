import { z } from 'zod';

export const CreateAgreementSchema = z.object({
  payerAgent: z.string().min(1),
  workerAgent: z.string().min(1),
  taskDescription: z.string().min(5),
  paymentAmount: z.number().positive(),
});

export type CreateAgreementRequest = z.infer<typeof CreateAgreementSchema>;
