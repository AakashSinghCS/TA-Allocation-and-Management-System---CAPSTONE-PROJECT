import type Section from '../../interfaces/section/Section';
import type {SectionDetails} from '../../interfaces/section/SectionDetails';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import { mockCourseCOSC111 } from '../course/mockCourseCOSC111';
import type { Need } from '../../interfaces/need/Need';

export const mockSectionCOSC111Details : SectionDetails = {
    id: mockCourseCOSC111.id,
    sectionId: 90,
    name: mockCourseCOSC111.name,
    deptCode : mockCourseCOSC111.deptCode,
    courseNum : mockCourseCOSC111.courseNum,
    section: "001",
    term : "Winter 2023",
    type : "Lecture"
}

export const mockSectionScheduleCOSC111ForTue : SectionSchedule = {
    sectionId: 1,
    day: "Wed",
    startTime : "15:00",
    endTime: "17:00"
}

export const mockSectionScheduleCOSC111ForFri : SectionSchedule = {
    sectionId: 1,
    day: "Fri",
    startTime : "15:00",
    endTime: "17:00"
}

const mockSectionNeedCOSC111 :Need = {
    sectionId: mockSectionCOSC111Details.id,
    description: "I need smart people",
    numOfHoursCurrentlyAllocated: 0,
    courseNeeds: [mockCourseCOSC111]
}

export const mockSectionCOSC111 : Section = {
    sectionDetails : mockSectionCOSC111Details,
    sectionSchedule : [mockSectionScheduleCOSC111ForTue,mockSectionScheduleCOSC111ForFri],
    need : mockSectionNeedCOSC111
}