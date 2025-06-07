import type TaProfilePageData from "../pages/taprofilepage/TaProfilePageData"
import { mockStudentJohnDoe } from "./mockStudentJohnDoe";
import { mockSectionCOSC111 } from "./mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForTue } from "./mockSectionCOSC111";
import { mockSectionScheduleCOSC111ForFri } from "./mockSectionCOSC111";

export const mockTaProfilePageData: TaProfilePageData = {
  student: mockStudentJohnDoe,
  section: { sectionDetails: mockSectionCOSC111, sectionSchedule: [mockSectionScheduleCOSC111ForTue, mockSectionScheduleCOSC111ForFri] }
}