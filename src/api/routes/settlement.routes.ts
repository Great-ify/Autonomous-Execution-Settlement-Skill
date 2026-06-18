import { FastifyInstance } from 'fastify';
import * as SettlementService from '../../services/settlement.service';
import { SettlementSchema, SettlementRequest } from '../../schemas/settlement.schema';
import { validate } from '../../middleware/validation';

export default async function settlementRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: SettlementRequest }>('/', { preHandler: validate(SettlementSchema) }, async (request, reply) => {
    // const result = await SettlementService.releasePayment(request.body);
    const result = { status: 'DEPRECATED' };
    return reply.send(result);
  });
}
