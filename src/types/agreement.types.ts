import { AgreementState } from '../state-machine/agreementState';

export interface Agreement {
  id: string;
  payerAgent: string;
  workerAgent: string;
  taskDescription: string;
  paymentAmount: number;
  status: AgreementState;
  
  // Settlement readiness fields
  paymentStatus: 'pending' | 'released' | 'escrowed';
  fundedAt?: Date;
  completedAt?: Date;
  settlementReference?: string;
  escrowReference?: string;

  createdAt: Date;
  updatedAt: Date;
  requirements: Requirement[];
}

export interface Requirement {
  id: string;
  description: string;
}
