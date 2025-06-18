import type Transcript from "./Transcript";
import type Offer from "./Offer";


export default interface Application {
  id: number;
  studentId: number;
  isAccepted: boolean;
  subjectPreferences1: string;
  subjectPreferences2: string;
  subjectPreferences3: string;
  wantRemote: boolean;
  wantWorkingHours: number;
  submittedAt: string; 
  transcript: Transcript;
  offers: Offer[];
}
