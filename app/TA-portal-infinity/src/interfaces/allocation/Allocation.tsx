
import type Section from "../section/Section";
import type { Student } from "../user/Student";
import type { ApplicationDto } from "../application/Application";
import type { ApplicationStatus } from "../enum/ApplicationStatus";

export interface Allocation {
  id?: number;
  student?: Student; 
  application?: ApplicationDto;       
  status?: ApplicationStatus;
  numberOfHours?: number;
  section?: Section;
}