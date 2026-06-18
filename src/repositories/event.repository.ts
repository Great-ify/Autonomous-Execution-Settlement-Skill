import { AgreementEvent } from '../types/event.types';
import { readData, writeData } from '../utils/fileStorage';

export interface EventRepository {
  append(event: AgreementEvent): Promise<void>;
  getByAgreementId(agreementId: string): Promise<AgreementEvent[]>;
}

export class FileEventRepository implements EventRepository {
  private filename = 'events.json';

  async append(event: AgreementEvent): Promise<void> {
    const events = await readData<AgreementEvent>(this.filename);
    events.push(event);
    await writeData(this.filename, events);
  }

  async getByAgreementId(agreementId: string): Promise<AgreementEvent[]> {
    const events = await readData<AgreementEvent>(this.filename);
    return events.filter(e => e.agreementId === agreementId);
  }
}
