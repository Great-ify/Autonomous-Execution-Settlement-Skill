import { AgreementState } from './agreementState';
import { canTransition } from './guards';
import { AppError } from '../utils/AppError';
import { addEvent } from '../services/event.service';

export const transitionAgreement = async (
  agreementId: string,
  fromState: AgreementState,
  toState: AgreementState,
  triggeredBy: string
): Promise<void> => {
  if (!canTransition(fromState, toState)) {
    throw new AppError(`Invalid state transition from ${fromState} to ${toState}`, 400);
  }

  // Log the event
  await addEvent({
    agreementId,
    fromState,
    toState,
    triggeredBy,
    timestamp: new Date(),
  });
};
