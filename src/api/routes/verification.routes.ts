import { FastifyInstance } from 'fastify';
import * as VerificationService from '../../services/verification.service';
import { VerifyWorkSchema, VerifyWorkRequest } from '../../schemas/verification.schema';
import { validate } from '../../middleware/validation';

export default async function verificationRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: VerifyWorkRequest }>('/', { preHandler: validate(VerifyWorkSchema) }, async (request, reply) => {
    const result = await VerificationService.verifyWork(request.body);
    return reply.send(result);
  });
}
