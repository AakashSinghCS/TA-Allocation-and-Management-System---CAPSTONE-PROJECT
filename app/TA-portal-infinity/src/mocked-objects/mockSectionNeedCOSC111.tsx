import type { Need } from "../interfaces/need/Need";
import { mockSectionCOSC111 } from "./mockSectionCOSC111";
import { mockCourseCOSC111 } from "./mockCourseCOSC111";

export const mockSectionNeedCOSC111 :Need = {
    id : 1,
    sectionId: mockSectionCOSC111.sectionDetails.id,
    description: "I need smart people",
    numOfHoursCurrentlyAllocated: 0,
    courseNeeds: [mockCourseCOSC111]
}