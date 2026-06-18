import { DecisionRecord } from '../types/risk.types';
import { readData, writeData } from '../utils/fileStorage';

export interface DecisionRecordRepository {
  create(record: DecisionRecord): Promise<void>;
}

export class FileDecisionRecordRepository implements DecisionRecordRepository {
  private filename = 'decision_records.json';

  async create(record: DecisionRecord): Promise<void> {
    const records = await readData<DecisionRecord>(this.filename);
    records.push(record);
    await writeData(this.filename, records);
  }
}
