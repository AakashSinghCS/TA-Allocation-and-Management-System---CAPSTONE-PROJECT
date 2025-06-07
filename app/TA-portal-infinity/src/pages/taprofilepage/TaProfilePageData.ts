import type Student from '../../interfaces/Student';
import type Section from '../../interfaces/Section';

export default interface TaProfilePageData {
    student: Student;
    section?: Section;
}