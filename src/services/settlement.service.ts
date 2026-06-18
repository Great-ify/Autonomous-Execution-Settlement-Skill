import { subscribeToEvent } from '../events/eventBus';
import { orchestrateSettlement } from '../settlement/orchestrator';

export const initSettlementSubscriptions = () => {
    subscribeToEvent('decision.approved', async (event: any) => {
        await orchestrateSettlement(event.agreementId, 'APPROVED');
    });
    subscribeToEvent('decision.rejected', async (event: any) => {
        await orchestrateSettlement(event.agreementId, 'REJECTED');
    });
    // etc... 
};
