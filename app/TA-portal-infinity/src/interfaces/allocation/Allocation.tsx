import type Section from "../section/Section";
import type { Student } from "../user/Student";
import type { OfferDto } from "../application/Application";

export interface Allocation {
  id?: number;
  student?: Student;
  offer?: OfferDto;        
  isConfirmed?: boolean;
  numberOfHours?: number;
  section?: Section;
}