import { z } from 'zod';

export const SubmitWorkSchema = z.object({
  agreementId: z.string().min(1),
  submittedBy: z.string().min(1),
  payload: z.record(z.unknown()), // payload is an object
});

export type SubmitWorkRequest = z.infer<typeof SubmitWorkSchema>;
