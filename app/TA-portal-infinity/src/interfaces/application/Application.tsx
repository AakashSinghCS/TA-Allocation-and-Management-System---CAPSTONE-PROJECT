// src/types/application.ts

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
  id: number;
  courseName: string;
  section: string;
  status: string;
  assignedHours: number;
}

export interface ApplicationRequest {
  preferences: string[];            // List<Subject>
  wantRemote: boolean;
  wantWorkingHours: number;
  availabilities: AvailabilityDto[];
}

export interface ApplicationDto {
  studentId: number;
  preferences: string[];
  wantRemote: boolean;
  wantWorkingHours: number;
  timeSubmitted: string;           // ISO date-time
  availabilities: AvailabilityDto[];

  // optional—your DTO doesn’t yet send these,
  // but if/when it does they’ll slot right in:
  transcript?: TranscriptDto;
  offers?: OfferDto[];
}
