import { AgentReputation } from '../types/risk.types';
import { readData, writeData } from '../utils/fileStorage';

export class ReputationService {
  private filename = 'reputations.json';

  async getReputation(agentId: string): Promise<AgentReputation> {
    const data = await readData<any>(this.filename);
    return data[agentId] || { 
      completedAgreements: 0, 
      failedAgreements: 0, 
      disputedAgreements: 0, 
      escalatedAgreements: 0, 
      successRate: 1.0, 
      trustScore: 1.0 
    };
  }

  async updateReputation(agentId: string, outcome: 'SUCCESS' | 'FAILURE' | 'DISPUTE' | 'ESCALATION'): Promise<void> {
    const data = await readData<Record<string, AgentReputation>>(this.filename);
    const reputation = data[agentId] || { 
      completedAgreements: 0, 
      failedAgreements: 0, 
      disputedAgreements: 0, 
      escalatedAgreements: 0, 
      successRate: 1.0, 
      trustScore: 1.0 
    };

    if (outcome === 'SUCCESS') {
      reputation.completedAgreements += 1;
    } else if (outcome === 'FAILURE') {
      reputation.failedAgreements += 1;
    } else if (outcome === 'DISPUTE') {
      reputation.disputedAgreements += 1;
    } else if (outcome === 'ESCALATION') {
      reputation.escalatedAgreements += 1;
    }

    const total = reputation.completedAgreements + reputation.failedAgreements + reputation.disputedAgreements + reputation.escalatedAgreements;
    if (total > 0) {
      reputation.successRate = reputation.completedAgreements / total;
      reputation.trustScore = (reputation.completedAgreements - reputation.failedAgreements - reputation.disputedAgreements - reputation.escalatedAgreements) / total;
    }
    
    data[agentId] = reputation;
    await writeData(this.filename, data);
  }
}
