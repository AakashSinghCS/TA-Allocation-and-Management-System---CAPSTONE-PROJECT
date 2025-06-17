import type Section from '../interfaces/section/Section';
import type {SectionDetails} from '../interfaces/section/SectionDetails';
import type SectionSchedule from '../interfaces/section/SectionSchedule';



export const mockSectionCOSC111Details : SectionDetails = {
    id: 1,
    name: "Introduction to ComputerScienceasdfasdfasdfasdfadsfasdfasdf",
    deptCode : "COSC",
    courseNum : "111",
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