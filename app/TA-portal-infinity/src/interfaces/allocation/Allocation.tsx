import type Section from "../section/Section";
import type { Student } from "../user/Student";
import type { ApplicationDto } from "../application/Application";

export interface Allocation {
  id?: number;
  student?: Student; 
  application?: ApplicationDto;       
  isConfirmed?: boolean;
  numberOfHours?: number;
  section?: Section;
}