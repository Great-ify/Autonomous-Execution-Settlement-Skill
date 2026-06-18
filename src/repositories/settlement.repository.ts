import path from 'path';
import { SettlementRecord } from '../types/settlement.types';
import { readData, writeData } from '../utils/fileStorage';

/**
 * FileSettlementRepository
 *
 * Fix: the original used a relative filename '../data/settlements.json' which
 * resolves differently depending on the process working directory. All file
 * repositories should use a plain filename and let fileStorage.ts resolve it
 * against DATA_DIR (process.cwd()/data), consistent with every other repo.
 */
export interface SettlementRepository {
  create(record: SettlementRecord): Promise<void>;
  update(record: SettlementRecord): Promise<void>;
  findById(settlementId: string): Promise<SettlementRecord | null>;
  list(): Promise<SettlementRecord[]>;
}

export class FileSettlementRepository implements SettlementRepository {
  private filename = 'settlements.json'; // resolved by fileStorage to <cwd>/data/settlements.json

  async create(record: SettlementRecord): Promise<void> {
    const records = await readData<SettlementRecord>(this.filename);
    records.push(record);
    await writeData(this.filename, records);
  }

  async update(record: SettlementRecord): Promise<void> {
    const records = await readData<SettlementRecord>(this.filename);
    const index   = records.findIndex(r => r.settlementId === record.settlementId);
    if (index !== -1) {
      records[index] = record;
      await writeData(this.filename, records);
    }
  }

  async findById(settlementId: string): Promise<SettlementRecord | null> {
    const records = await readData<SettlementRecord>(this.filename);
    return records.find(r => r.settlementId === settlementId) ?? null;
  }

  async list(): Promise<SettlementRecord[]> {
    return readData<SettlementRecord>(this.filename);
  }
}