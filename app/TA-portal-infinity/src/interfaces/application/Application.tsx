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

import type { ApplicationType } from '../enum/ApplicationType';
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
  student: {
    id: number;                
    firstName: string;
    lastName: string;
    studentNum: string | null;
    program: string | null;
    enrollmentYear: number | null;
    schoolYear: string | null;
  };
  preferences: string[];
  wantRemote: boolean;
  wantWorkingHours: number;
  timeSubmitted: string;
  applicationType: ApplicationType;
  unavailabilities: UnavailabilityDto[];
  transcript?: TranscriptDto;
  offers?: OfferDto[];
}
