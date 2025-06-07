import { fetchStudentTakesSections } from "./fetchStudentTakesSections";
import { fetchSection } from "../section/fetchSection";
import type Section from "../../interfaces/section/Section";
import type StudentTakesSection from "../../interfaces/student/StudentTakesSection";

export async function fetchAllStudentSectionsHasCompleted(studentId: number, hasCompletedFilter:boolean): Promise<Section[]> {

    const studentTakes: StudentTakesSection = await fetchStudentTakesSections(studentId);
    const studentSectionPromises  = studentTakes.sections
        .filter(({hasCompleted})=>hasCompletedFilter == hasCompleted)
        .map( async({sectionId})=>{
            const section: Section = await fetchSection(sectionId);
        return section;
    })

    const studentSections: Section[] = await Promise.all(studentSectionPromises);

    return studentSections;
}