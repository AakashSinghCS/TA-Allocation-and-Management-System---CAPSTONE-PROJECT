import type Section from "../section/Section";
import type { Student } from "../user/Student";
import type Offer from "../application/Offer";

export interface Allocation{
    id? :number;
    student? : Student;
    offer? : Offer;
    isConfirmed? : boolean;
    numberOfHours? :number;
    section?: Section;
}