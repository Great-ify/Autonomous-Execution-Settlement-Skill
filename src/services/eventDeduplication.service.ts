import { readData, writeData } from '../utils/fileStorage';

export class EventDeduplicationService {
  private filename = '../data/processed_events.json';

  async isProcessed(eventId: string): Promise<boolean> {
    const data = await readData<Record<string, boolean>>(this.filename);
    return !!data[eventId];
  }

  async markProcessed(eventId: string): Promise<void> {
    const data = await readData<Record<string, boolean>>(this.filename);
    data[eventId] = true;
    await writeData(this.filename, data);
  }
}
