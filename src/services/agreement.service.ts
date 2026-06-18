import { Agreement } from '../types/agreement.types';
import { AgreementState } from '../state-machine/agreementState';
import { CreateAgreementRequest } from '../schemas/agreement.schema';
import { transitionAgreement } from '../state-machine/stateMachine';
import { getEventsByAgreementId } from '../services/event.service';
import { FileAgreementRepository } from '../repositories/agreement.repository';

const agreementRepo = new FileAgreementRepository();

export const createAgreement = async (data: CreateAgreementRequest): Promise<Agreement> => {
  const id = Math.random().toString(36).substring(7);
  const agreement: Agreement = {
    ...data,
    id,
    status: AgreementState.CREATED,
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    requirements: [],
  };
  await agreementRepo.create(agreement);
  return agreement;
};

export const getAgreement = async (id: string): Promise<Agreement | null> => {
  return await agreementRepo.findById(id);
};

export const getAgreementEvents = async (id: string) => {
  return await getEventsByAgreementId(id);
};

export const updateAgreementState = async (id: string, nextState: AgreementState, triggeredBy: string): Promise<Agreement> => {
  const agreement = await agreementRepo.findById(id);
  if (!agreement) throw new Error('Agreement not found');

  await transitionAgreement(id, agreement.status, nextState, triggeredBy);
  
  const updatedAgreement = { ...agreement, status: nextState, updatedAt: new Date() };
  await agreementRepo.update(id, updatedAgreement);
  
  return updatedAgreement;
};
