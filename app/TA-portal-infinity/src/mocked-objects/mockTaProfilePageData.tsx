import type TaProfilePageData from "../interfaces/taprofile/TaProfilePageData"
import { mockStudentJohnDoe } from "./mockStudents";
import { mockSectionCOSC111 } from "./mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForTue } from "./mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForFri } from "./mockSectionCOSC111";

export const mockTaProfilePageData: TaProfilePageData = {
  student: mockStudentJohnDoe,
  sectionsTaken: [{ sectionDetails: mockSectionCOSC111, sectionSchedule: [mockSectionScheduleCOSC111ForTue, mockSectionScheduleCOSC111ForFri] }]
}