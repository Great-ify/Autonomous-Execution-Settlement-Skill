import { AgreementEvent } from '../types/event.types';
import { FileEventRepository } from '../repositories/event.repository';
import { publishEvent } from '../events/eventBus';

const eventRepo = new FileEventRepository();

export const addEvent = async (event: AgreementEvent): Promise<void> => {
  await eventRepo.append(event);
  publishEvent('agreement.transition', event);
};

export const getEventsByAgreementId = async (agreementId: string): Promise<AgreementEvent[]> => {
  return await eventRepo.getByAgreementId(agreementId);
};
