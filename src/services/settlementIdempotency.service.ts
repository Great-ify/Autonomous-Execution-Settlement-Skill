import { readData, writeData } from '../utils/fileStorage';

export class SettlementIdempotencyService {
  private filename = '../data/idempotency.json';

  async isProcessed(key: string): Promise<boolean> {
    const data = await readData<Record<string, boolean>>(this.filename);
    return !!data[key];
  }

  async markProcessed(key: string): Promise<void> {
    const data = await readData<Record<string, boolean>>(this.filename);
    data[key] = true;
    await writeData(this.filename, data);
  }
}
