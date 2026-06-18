import { EscrowAccount } from '../types/escrow.types';
import { readData, writeData } from '../utils/fileStorage';

/**
 * FileEscrowRepository
 *
 * Fix: the original used '../data/escrows.json' as the filename, which
 * resolves relative to the process cwd and breaks when the server is started
 * from a directory other than the project root. Changed to 'escrows.json' so
 * fileStorage.ts resolves it consistently to <cwd>/data/escrows.json,
 * matching every other repository in the codebase.
 */
export interface EscrowRepository {
  create(account: EscrowAccount): Promise<void>;
  update(account: EscrowAccount): Promise<void>;
  findByAgreementId(agreementId: string): Promise<EscrowAccount | null>;
  list(): Promise<EscrowAccount[]>;
}

export class FileEscrowRepository implements EscrowRepository {
  private filename = 'escrows.json'; // resolved by fileStorage to <cwd>/data/escrows.json

  async create(account: EscrowAccount): Promise<void> {
    const accounts = await readData<EscrowAccount>(this.filename);
    accounts.push(account);
    await writeData(this.filename, accounts);
  }

  async update(account: EscrowAccount): Promise<void> {
    const accounts = await readData<EscrowAccount>(this.filename);
    const index    = accounts.findIndex(a => a.escrowId === account.escrowId);
    if (index !== -1) {
      accounts[index] = account;
      await writeData(this.filename, accounts);
    }
  }

  async findByAgreementId(agreementId: string): Promise<EscrowAccount | null> {
    const accounts = await readData<EscrowAccount>(this.filename);
    return accounts.find(a => a.agreementId === agreementId) ?? null;
  }

  async list(): Promise<EscrowAccount[]> {
    return readData<EscrowAccount>(this.filename);
  }
}