import { fetchStudentDetails } from "./fetchStudentDetails";
import { fetchStudentSectionDetails } from "./fetchStudentSectionDetails";
import type TaProfilePageData from "../../pages/taprofilepage/TaProfilePageData";
import type Section from "../../interfaces/Section";
//temporary import until the backend works:
import { mockStudentJohnDoe } from "../../mocked-objects/mockStudentJohnDoe";
import { mockSectionCOSC111 } from "../../mocked-objects/mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForFri } from "../../mocked-objects/mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForTue } from "../../mocked-objects/mockSectionCOSC111";

export async function fetchTaProfilePageData(studentId: number): Promise<TaProfilePageData> {

    const student = mockStudentJohnDoe;
    let sectionDetails = mockSectionCOSC111;
    let sectionSchedule = [mockSectionScheduleCOSC111ForTue,mockSectionScheduleCOSC111ForFri]

    /** IMPORTANT: DO NOT DELETE COMMENT BELOW. will uncomment after backend works. For now, I'm just mocking the data.**/
    // const [student, sectionDetails] = await Promise.all([
    //     fetchStudentDetails(studentId),
    //     fetchStudentSectionDetails(studentId),
    // ]);

    const section  :Section= {
        sectionDetails : sectionDetails,
        sectionSchedule: sectionSchedule
    }

    return { student, section };
}