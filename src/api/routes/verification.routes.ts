import { FastifyInstance } from 'fastify';
import * as VerificationService from '../../services/verification.service';
import { VerifyWorkSchema, VerifyWorkRequest } from '../../schemas/verification.schema';
import { validate } from '../../middleware/validation';

export default async function verificationRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/verify
   *
   * Triggers the full verification pipeline for a submitted agreement.
   * Runs rule engine → AI judge → risk engine → decision in sequence.
   *
   * Body: { agreementId: string }
   */
  fastify.post<{ Body: VerifyWorkRequest }>(
    '/',
    { preHandler: validate(VerifyWorkSchema) },
    async (request, reply) => {
      const { agreementId } = request.body;

      const result = await VerificationService.processSubmission(agreementId);

      if (!result) {
        return reply.status(404).send({
          error: 'Verification failed',
          message: `No agreement or submission found for agreementId: ${agreementId}`,
        });
      }

      return reply.send(result);
    },
  );
}