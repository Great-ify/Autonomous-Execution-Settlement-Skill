import { Agreement } from '../types/agreement.types';
import { readData, writeData } from '../utils/fileStorage';

export interface AgreementRepository {
  create(agreement: Agreement): Promise<void>;
  findById(id: string): Promise<Agreement | null>;
  update(id: string, agreement: Partial<Agreement>): Promise<void>;
  list(): Promise<Agreement[]>;
}

export class FileAgreementRepository implements AgreementRepository {
  private filename = 'agreements.json';

  async create(agreement: Agreement): Promise<void> {
    const agreements = await readData<Agreement>(this.filename);
    agreements.push(agreement);
    await writeData(this.filename, agreements);
  }

  async findById(id: string): Promise<Agreement | null> {
    const agreements = await readData<Agreement>(this.filename);
    return agreements.find(a => a.id === id) || null;
  }

  async update(id: string, agreement: Partial<Agreement>): Promise<void> {
    let agreements = await readData<Agreement>(this.filename);
    agreements = agreements.map(a => a.id === id ? { ...a, ...agreement } : a);
    await writeData(this.filename, agreements);
  }

  async list(): Promise<Agreement[]> {
    return await readData<Agreement>(this.filename);
  }
}
