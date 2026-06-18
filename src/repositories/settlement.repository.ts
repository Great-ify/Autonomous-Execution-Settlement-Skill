import { SettlementRecord } from '../types/settlement.types';
import { readData, writeData } from '../utils/fileStorage';

export interface SettlementRepository {
  create(record: SettlementRecord): Promise<void>;
  update(record: SettlementRecord): Promise<void>;
}

export class FileSettlementRepository implements SettlementRepository {
  private filename = '../data/settlements.json';

  async create(record: SettlementRecord): Promise<void> {
    const records = await readData<SettlementRecord>(this.filename);
    records.push(record);
    await writeData(this.filename, records);
  }

  async update(record: SettlementRecord): Promise<void> {
    const records = await readData<SettlementRecord>(this.filename);
    const index = records.findIndex(r => r.settlementId === record.settlementId);
    if(index !== -1) {
        records[index] = record;
        await writeData(this.filename, records);
    }
  }
}
