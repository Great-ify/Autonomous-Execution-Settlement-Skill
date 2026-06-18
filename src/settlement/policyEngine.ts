import { SettlementAction } from '../types/settlement.types';
import { DecisionOutcome } from '../types/risk.types';

export interface SettlementPolicy {
  getAction(outcome: DecisionOutcome): SettlementAction;
}

export const StandardSettlementPolicy: SettlementPolicy = {
  getAction: (outcome) => {
    switch(outcome) {
      case DecisionOutcome.APPROVED: return SettlementAction.RELEASE_FUNDS;
      case DecisionOutcome.REJECTED: return SettlementAction.REFUND_FUNDS;
      case DecisionOutcome.ESCALATED: return SettlementAction.HOLD_FUNDS;
      default: return SettlementAction.FREEZE_FUNDS;
    }
  }
};
