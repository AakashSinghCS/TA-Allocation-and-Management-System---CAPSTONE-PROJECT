import type { ApplicationDto } from "../application/Application";
import type { ApplicationStatus } from "../enum/ApplicationStatus";
import type { AllocatedSection, Allocation } from "./Allocation";

export default interface RawAllocationDto {
  id: number;
  student: Allocation['student'];
  applicationDto: ApplicationDto;
  status?: ApplicationStatus;
  labPrepHours : number;
  gradingHours : number;
  sectionHours : number;
  allocatedSections: AllocatedSection[];
}