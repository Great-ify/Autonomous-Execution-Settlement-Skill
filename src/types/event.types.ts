import { AgreementState } from '../state-machine/agreementState';

export interface AgreementEvent {
  agreementId: string;
  fromState: AgreementState;
  toState: AgreementState;
  triggeredBy: string;
  timestamp: Date;
}
