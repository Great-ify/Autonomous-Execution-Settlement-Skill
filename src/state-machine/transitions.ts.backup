import { AgreementState } from './agreementState';

export const ALLOWED_TRANSITIONS: Record<AgreementState, AgreementState[]> = {
  [AgreementState.CREATED]: [AgreementState.FUNDED],
  [AgreementState.FUNDED]: [AgreementState.ACTIVE],
  [AgreementState.ACTIVE]: [AgreementState.SUBMITTED],
  [AgreementState.SUBMITTED]: [AgreementState.UNDER_REVIEW],
  [AgreementState.UNDER_REVIEW]: [AgreementState.COMPLETED, AgreementState.FAILED],
  [AgreementState.COMPLETED]: [],
  [AgreementState.FAILED]: [],
  [AgreementState.SETTLEMENT_PENDING]: [],
  [AgreementState.SETTLED]: [],
  [AgreementState.REFUNDED]: [],
  [AgreementState.FROZEN]: [],
};
