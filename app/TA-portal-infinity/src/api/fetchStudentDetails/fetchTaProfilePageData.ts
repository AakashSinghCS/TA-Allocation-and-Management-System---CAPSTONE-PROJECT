import { fetchStudentDetails } from "./fetchStudentDetails";
import { fetchStudentSectionDetails } from "./fetchStudentSectionDetails";
import type TaProfilePageData from "../../pages/taprofilepage/TaProfilePageData";
import type Section from "../../interfaces/Section";

export async function fetchTaProfilePageData(studentId: number): Promise<TaProfilePageData> {

    const [student, sectionDetails] = await Promise.all([
        fetchStudentDetails(studentId),
        fetchStudentSectionDetails(studentId),
    ]);

    const section  :Section= {
        sectionDetails : sectionDetails,
        sectionSchedule: [] //empty for now until backend is implemented.
    }

    return { student, section };
}