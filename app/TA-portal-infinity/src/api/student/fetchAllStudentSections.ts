import { fetchStudentTakesSections } from "./fetchStudentTakesSections";
import { fetchSection } from "../section/fetchSection";
import type Section from "../../interfaces/section/Section";
import type StudentTakesSection from "../../interfaces/student/StudentTakesSection";
import type SectionHasCompleted from "../../interfaces/section/SectionHasCompleted";

export async function fetchAllStudentSections(studentId: number): Promise<SectionHasCompleted[]> {

    const studentTakes: StudentTakesSection = await fetchStudentTakesSections(studentId);
    const studentSectionPromises  = studentTakes.sections
        .map( async({sectionId, hasCompleted})=>{
            const section: Section = await fetchSection(sectionId);
        return  {section, hasCompleted}
    })

    const SectionHasCompletedArray : SectionHasCompleted[] = await Promise.all(studentSectionPromises);

    return SectionHasCompletedArray;
}