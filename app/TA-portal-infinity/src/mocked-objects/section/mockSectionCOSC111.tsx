import type Section from '../../interfaces/section/Section';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import { mockCourseCOSC111 } from '../course/mockCourseCOSC111';
import type { Need } from '../../interfaces/need/Need';
import type { SectionProfile } from '../../interfaces/section/Section';
import { mockInstructorChed } from '../user/mockInstructorChed';
import type SectionDetails from '../../interfaces/section/SectionDetails';


export const mockSectionCOSC111Details:SectionDetails = {
    id: 90,
    section: "001",
    semester: "W1",
    type: "LECTURE",
    year: 2024,
    course: {
        id: mockCourseCOSC111.id,
        name: mockCourseCOSC111.name,
        deptCode: mockCourseCOSC111.deptCode,
        courseNum: mockCourseCOSC111.courseNum,
    }
}

export const mockSectionScheduleCOSC111ForTue: SectionSchedule = {
    sectionId: 1,
    day: "Wed",
    startTime: "15:00",
    endTime: "17:00"
}

export const mockSectionScheduleCOSC111ForFri: SectionSchedule = {
    sectionId: 1,
    day: "Fri",
    startTime: "15:00",
    endTime: "17:00"
}

// const mockSectionNeedCOSC111 :Need = {
//     sectionId: mockSectionCOSC111Details.id,
//     description: "I need smart people",
//     numOfHoursCurrentlyAllocated: 0,
//     courseNeeds: [mockCourseCOSC
// }

export const mockSectionCOSC111: Section = {
    ...mockSectionCOSC111Details,
    sectionSchedule: [mockSectionScheduleCOSC111ForTue, mockSectionScheduleCOSC111ForFri],
    instructor: mockInstructorChed
    // need : mockSectionNeedCOSC111
}

export const mockSectionCOSC111Profile: SectionProfile = {
    section: "001",
    semester: "W1",
    type: "LECTURE",
    year: 2024
}