import { readData, writeData } from '../utils/fileStorage';

/**
 * SettlementIdempotencyService
 *
 * Fix: was using '../data/idempotency.json' as the filename, which resolves
 * relative to the process cwd and breaks depending on where the process is
 * started from — same class of bug as escrow.repository.ts and
 * settlement.repository.ts. Changed to a plain filename so fileStorage.ts
 * resolves it consistently to <cwd>/data/idempotency.json.
 */
export class SettlementIdempotencyService {
  private filename = 'idempotency.json'; // resolved by fileStorage to <cwd>/data/idempotency.json

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
