import type Section from '../interfaces/section/Section';
import type {SectionDetails} from '../interfaces/section/SectionDetails';
import type SectionSchedule from '../interfaces/section/SectionSchedule';
import { mockCourseCOSC121 } from './mockCourseCOSC121';
import type { Need } from '../interfaces/need/Need';
import { mockCourseCOSC111 } from './mockCourseCOSC111';
export const mockSectionCOSC121Details : SectionDetails = {
    id: mockCourseCOSC121.id,
    sectionId: 91,
    name: mockCourseCOSC121.name,
    deptCode : mockCourseCOSC121.deptCode,
    courseNum : mockCourseCOSC121.courseNum,
    section: "001",
    term : "Winter 2023",
    type : "Lecture"
}

export const mockSectionScheduleCOSC121ForWed : SectionSchedule = {
    sectionId: 1,
    day: "Wed",
    startTime : "14:00",
    endTime: "16:00"
}

export const mockSectionScheduleCOSC121ForThu : SectionSchedule = {
    sectionId: 1,
    day: "Thu",
    startTime : "14:00",
    endTime: "16:00"
}

const mockSectionNeedCOSC121 :Need = {
    sectionId: mockSectionCOSC121Details.id,
    description: "I need smart people",
    numOfHoursCurrentlyAllocated: 0,
    courseNeeds: [mockCourseCOSC111]
}


export const mockSectionCOSC121 : Section = {
    sectionDetails : mockSectionCOSC121Details,
    sectionSchedule : [mockSectionScheduleCOSC121ForWed,mockSectionScheduleCOSC121ForThu],
    need: mockSectionNeedCOSC121
}