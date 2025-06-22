import type Transcript from "./Transcript";
import type Offer from "./Offer";
export type Day =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface Availability {
  day: Day;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "12:00"
}

export default interface Application {
  id: number;
  studentId: number;
  isAccepted: boolean;
  subjectPreferences1: string;
  subjectPreferences2: string;
  subjectPreferences3: string;
  wantRemote: boolean;
  wantWorkingHours: number;
  submittedAt: string; // ISO datetime string
  transcript: Transcript;
  offers: Offer[];
  availability: Availability[]; // inline availability slots
}