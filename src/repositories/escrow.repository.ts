import { EscrowAccount } from '../types/escrow.types';
import { readData, writeData } from '../utils/fileStorage';

export interface EscrowRepository {
  create(account: EscrowAccount): Promise<void>;
  update(account: EscrowAccount): Promise<void>;
  findByAgreementId(agreementId: string): Promise<EscrowAccount | null>;
}

export class FileEscrowRepository implements EscrowRepository {
  private filename = '../data/escrows.json';

  async create(account: EscrowAccount): Promise<void> {
    const accounts = await readData<EscrowAccount>(this.filename);
    accounts.push(account);
    await writeData(this.filename, accounts);
  }

  async update(account: EscrowAccount): Promise<void> {
    const accounts = await readData<EscrowAccount>(this.filename);
    const index = accounts.findIndex(a => a.escrowId === account.escrowId);
    if(index !== -1) {
        accounts[index] = account;
        await writeData(this.filename, accounts);
    }
  }

  async findByAgreementId(agreementId: string): Promise<EscrowAccount | null> {
    const accounts = await readData<EscrowAccount>(this.filename);
    return accounts.find(a => a.agreementId === agreementId) || null;
  }
}
