import type { Student } from "../user/Student";
import type { ApplicationDto } from "../application/Application";
import type { ApplicationStatus } from "../enum/ApplicationStatus";

export type AllocationType =
    | "GRADING"
    | "LAB_PREP"
    | "LAB"

export interface AllocatedSection {
  id: number;
  sectionId: number;
  // allocationId : number;
  task: AllocationType;
  hours: number;
}
export interface Allocation {
  id?: number;
  student?: Student; 
  application?: ApplicationDto;       
  status?: ApplicationStatus;
  labPrepHours? : number;
  gradingHours? : number;
  sectionHours? : number;
  allocatedSections?: AllocatedSection[];
}