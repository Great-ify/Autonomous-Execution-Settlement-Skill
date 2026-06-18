import { AgreementState } from './agreementState';
import { ALLOWED_TRANSITIONS } from './transitions';

export const canTransition = (from: AgreementState, to: AgreementState): boolean => {
  return ALLOWED_TRANSITIONS[from].includes(to);
};

export const isValidState = (state: string): state is AgreementState => {
  return Object.values(AgreementState).includes(state as AgreementState);
};
