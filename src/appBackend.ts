import Fastify from 'fastify';
import agreementRoutes from './api/routes/agreement.routes';
import executionRoutes from './api/routes/execution.routes';
import verificationRoutes from './api/routes/verification.routes';
import settlementRoutes from './api/routes/settlement.routes';
import { subscribeToEvent } from './events/eventBus';
import { processSubmission } from './services/verification.service';
import { AgreementState } from './state-machine/agreementState';

const app = Fastify({
  logger: true,
});

// Register Routes
app.register(agreementRoutes, { prefix: '/api/agreements' });
app.register(executionRoutes, { prefix: '/api/submissions' });
app.register(verificationRoutes, { prefix: '/api/verify' });
app.register(settlementRoutes, { prefix: '/api/settle' });

// Centralized error handler
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status((error as any).statusCode || 500).send({
    error: (error as any).name,
    message: (error as any).message,
  });
});

// Event Listener Initialization
subscribeToEvent('agreement.transition', async (event) => {
  if (event.toState === AgreementState.SUBMITTED) {
    try {
      await processSubmission(event.agreementId);
    } catch (e) {
      console.error('Verification failed:', e);
    }
  }
});

// Sprint 6
import { initSettlementSubscriptions } from './services/settlement.service';
initSettlementSubscriptions();

export default app;
