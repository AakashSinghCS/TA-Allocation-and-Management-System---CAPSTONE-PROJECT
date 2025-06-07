import type Student from '../../interfaces/Student';
import type {Section} from '../../interfaces/SectionDetails';

export default interface TaProfilePageData {
    student: Student;
    section?: Section;
}