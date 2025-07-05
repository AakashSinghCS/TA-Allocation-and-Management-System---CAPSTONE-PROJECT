
export type ApplicationStatus = 'SENT' | 'CONFIRMED' | 'REJECTED';

export interface ApplicationStatusInterface {
  status: ApplicationStatus;
}