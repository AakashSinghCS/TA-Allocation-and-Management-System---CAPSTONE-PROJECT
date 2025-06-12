import type Section from '../interfaces/section/Section';
import type {SectionDetails} from '../interfaces/section/SectionDetails';
import type SectionSchedule from '../interfaces/section/SectionSchedule';
import { mockCourseCOSC111 } from './mockCourseCOSC111';


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
    day: "Tue",
    startTime : "14:00",
    endTime: "16:00"
}

export const mockSectionScheduleCOSC111ForFri : SectionSchedule = {
    sectionId: 1,
    day: "Fri",
    startTime : "14:00",
    endTime: "16:00"
}

export const mockSectionCOSC111 : Section = {
    sectionDetails : mockSectionCOSC111Details,
    sectionSchedule : [mockSectionScheduleCOSC111ForTue,mockSectionScheduleCOSC111ForFri]
}