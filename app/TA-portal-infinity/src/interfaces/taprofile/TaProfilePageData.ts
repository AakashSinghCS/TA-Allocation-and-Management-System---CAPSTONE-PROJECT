import type Student from '../student/Student';
import type Section from '../section/Section';

export default interface TaProfilePageData {
    student: Student;
    sectionsTaken?: Section[];
}