import { FastifyInstance } from 'fastify';
import * as AgreementService from '../../services/agreement.service';
import { CreateAgreementSchema, CreateAgreementRequest } from '../../schemas/agreement.schema';
import { validate } from '../../middleware/validation';
import { AgreementState } from '../../state-machine/agreementState';

export default async function agreementRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateAgreementRequest }>('/', { preHandler: validate(CreateAgreementSchema) }, async (request, reply) => {
    const agreement = await AgreementService.createAgreement(request.body);
    return reply.send(agreement);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agreement = await AgreementService.getAgreement(id);
    if (!agreement) {
      return reply.status(404).send({ message: 'Agreement not found' });
    }
    return reply.send(agreement);
  });

  fastify.get('/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string };
    const events = await AgreementService.getAgreementEvents(id);
    return reply.send(events);
  });

  const transitionRoute = (pathSuffix: string, state: AgreementState) => {
    fastify.post(`/:id/${pathSuffix}`, async (request, reply) => {
      const { id } = request.params as { id: string };
      const agreement = await AgreementService.updateAgreementState(id, state, 'system');
      return reply.send(agreement);
    });
  };

  transitionRoute('fund', AgreementState.FUNDED);
  transitionRoute('activate', AgreementState.ACTIVE);
  transitionRoute('submit', AgreementState.SUBMITTED);
  transitionRoute('review', AgreementState.UNDER_REVIEW);
  transitionRoute('complete', AgreementState.COMPLETED);
  transitionRoute('fail', AgreementState.FAILED);
}
