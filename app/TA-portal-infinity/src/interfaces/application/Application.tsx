export type Day =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
  | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface AvailabilityDto {
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

export interface ApplicationRequest {
  preferences: string[];
  wantRemote: boolean;
  wantWorkingHours: number;
  availabilities: AvailabilityDto[];
}

export interface ApplicationDto {
  id: number;
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
  availabilities: AvailabilityDto[];
  transcript?: TranscriptDto;
  offers?: OfferDto[];
}
