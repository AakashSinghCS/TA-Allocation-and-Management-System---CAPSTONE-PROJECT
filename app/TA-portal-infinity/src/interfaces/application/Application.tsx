export type Day =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
  | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface UnavailabilityDto {
  day: Day;
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
}

export interface TranscriptDto {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface OfferDto {
  id:          number;
  isAccepted:  boolean;
  description: string;
}

import type { Allocation } from '../allocation/Allocation';
import type { ApplicationType } from '../enum/ApplicationType';
import type { Student } from '../user/Student';
export interface ApplicationRequest {
  preferences: string[];
  wantRemote: boolean;
  wantWorkingHours: number;
  unavailabilities: UnavailabilityDto[];
  applicationType: ApplicationType;
}


export interface ApplicationDto {
  id?:             number;
  applicationId?:  number;
  student: Student;
  preferences: string[];
  wantRemote: boolean;
  wantWorkingHours: number;
  timeSubmitted: string;
  applicationType: ApplicationType;
  unavailabilities: UnavailabilityDto[];
  transcript?: TranscriptDto;
  offers?: OfferDto[];
  allocation? :Allocation;
}
