import { TaskSubmission } from '../types/execution.types';
import { readData, writeData } from '../utils/fileStorage';

export interface SubmissionRepository {
  create(submission: TaskSubmission): Promise<void>;
  findByAgreementId(agreementId: string): Promise<TaskSubmission | null>;
}

export class FileSubmissionRepository implements SubmissionRepository {
  private filename = 'submissions.json';

  async create(submission: TaskSubmission): Promise<void> {
    const submissions = await readData<TaskSubmission>(this.filename);
    submissions.push(submission);
    await writeData(this.filename, submissions);
  }

  async findByAgreementId(agreementId: string): Promise<TaskSubmission | null> {
    const submissions = await readData<TaskSubmission>(this.filename);
    return submissions.find(s => s.agreementId === agreementId) || null;
  }
}
