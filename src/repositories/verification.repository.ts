import { VerificationResult } from '../types/verification.types';
import { readData, writeData } from '../utils/fileStorage';

export interface VerificationRepository {
  create(result: VerificationResult): Promise<void>;
  findByAgreementId(agreementId: string): Promise<VerificationResult | null>;
}

export class FileVerificationRepository implements VerificationRepository {
  private filename = 'verifications.json';

  async create(result: VerificationResult): Promise<void> {
    const results = await readData<VerificationResult>(this.filename);
    results.push(result);
    await writeData(this.filename, results);
  }

  async findByAgreementId(agreementId: string): Promise<VerificationResult | null> {
    const results = await readData<VerificationResult>(this.filename);
    return results.find(r => r.agreementId === agreementId) || null;
  }
}
