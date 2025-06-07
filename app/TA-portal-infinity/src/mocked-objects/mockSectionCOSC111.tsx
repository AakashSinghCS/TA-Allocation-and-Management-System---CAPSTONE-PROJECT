import type {Section} from '../interfaces/SectionDetails';
import type SectionSchedule from '../interfaces/SectionSchedule';

export const mockSectionCOSC111 : Section = {
    sectionId: 1,
    name: "Introduction to Computer Science",
    deptCode : "COSC",
    courseNum : "111",
    section: "001",
    term : "Winter 2023",
    type : "Lecture"
}

export const mockSectionScheduleCOSC111ForTue : SectionSchedule = {
    sectionId: 1,
    day: "Tue",
    startTime : "14:00:00",
    endTime: "16:00:00"
}

export const mockSectionScheduleCOSC111ForFri : SectionSchedule = {
    sectionId: 1,
    day: "Fri",
    startTime : "14:00:00",
    endTime: "16:00:00"
}