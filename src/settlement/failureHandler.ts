import { SettlementFailure } from '../types/settlement.types';
import { readData, writeData } from '../utils/fileStorage';

export const handleSettlementFailure = async (settlementId: string, reason: string): Promise<void> => {
  const failure: SettlementFailure = {
    settlementId,
    reason,
    failedAt: new Date(),
  };
  const failures = await readData<SettlementFailure>('../data/failures.json');
  failures.push(failure);
  await writeData('../data/failures.json', failures);
};
