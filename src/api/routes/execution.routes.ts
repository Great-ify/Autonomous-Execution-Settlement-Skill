import { FastifyInstance } from 'fastify';
import * as ExecutionService from '../../services/execution.service';
import { SubmitWorkSchema, SubmitWorkRequest } from '../../schemas/execution.schema';
import { validate } from '../../middleware/validation';

export default async function executionRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: SubmitWorkRequest }>('/', { preHandler: validate(SubmitWorkSchema) }, async (request, reply) => {
    const submission = await ExecutionService.submitWork(request.body);
    return reply.send(submission);
  });
}
