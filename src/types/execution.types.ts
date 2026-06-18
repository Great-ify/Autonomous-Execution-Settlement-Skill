export interface TaskSubmission {
  id: string;
  agreementId: string;
  submittedBy: string;
  payload: any;
  submittedAt: Date;
}
