import { EscrowAccount, EscrowStatus } from '../types/escrow.types';

export interface EscrowValidationResult {
  valid: boolean;
  reason?: string;
}

export const validateEscrow = (escrow: EscrowAccount): EscrowValidationResult => {
  if (!escrow) return { valid: false, reason: 'Escrow not found' };
  if (escrow.status !== EscrowStatus.FUNDED) return { valid: false, reason: 'Escrow not funded' };
  if (escrow.amount <= 0) return { valid: false, reason: 'Invalid amount' };
  return { valid: true };
};
