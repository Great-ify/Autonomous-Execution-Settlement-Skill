import { z } from 'zod';

export const VerifyWorkSchema = z.object({
  agreementId: z.string().min(1),
  payload: z.record(z.unknown()).optional(), // optional as per prompt implying only agreementId is strictly required string, but let's be safe
});

export type VerifyWorkRequest = z.infer<typeof VerifyWorkSchema>;
