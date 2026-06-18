import { TaskSubmission } from '../types/execution.types';
import { SubmitWorkRequest } from '../schemas/execution.schema';
import { FileSubmissionRepository } from '../repositories/submission.repository';

const submissionRepo = new FileSubmissionRepository();

export const submitWork = async (data: SubmitWorkRequest): Promise<TaskSubmission> => {
  const submission: TaskSubmission = {
    ...data,
    id: Math.random().toString(36).substring(7),
    submittedAt: new Date(),
  };
  await submissionRepo.create(submission);
  return submission;
};
