//Don't delete the yellow-underlined imports here. Will be used when backend works.
import { fetchStudentDetails } from "../student/fetchStudentDetails";
import { fetchStudentTakesSections } from "../student/fetchStudentTakesSections";
import { fetchAllStudentSections } from "../student/fetchAllStudentSections";
import type TaProfilePageData from "../../interfaces/taprofile/TaProfilePageData";
import type Section from "../../interfaces/section/Section";
//temporary imports until the backend works:
import { mockStudentJohnDoe } from "../../mocked-objects/mockStudents";
import { mockSectionCOSC111 } from "../../mocked-objects/mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForFri } from "../../mocked-objects/mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForTue } from "../../mocked-objects/mockSectionCOSC111";

export async function fetchTaProfilePageData(studentId: number): Promise<TaProfilePageData> {

    const student = mockStudentJohnDoe;
    let sections = mockSectionCOSC111;
    let sectionSchedule = [mockSectionScheduleCOSC111ForTue,mockSectionScheduleCOSC111ForFri]

    /** IMPORTANT: DO NOT DELETE COMMENT BELOW. will uncomment after backend works. For now, I'm just mocking the data.**/
    // const [student, sections] = await Promise.all([
    //     fetchStudentDetails(studentId),
    //     fetchAllStudentSections(studentId),
    // ]);
    // const sectionsTaken = sections.map(({section, hasCompleted})=>{
    //     return section;
    // })

    const sectionsTaken  :Section[]= [{
        sectionDetails : sections,
        sectionSchedule: sectionSchedule
    }]


    return { student, sectionsTaken };
}