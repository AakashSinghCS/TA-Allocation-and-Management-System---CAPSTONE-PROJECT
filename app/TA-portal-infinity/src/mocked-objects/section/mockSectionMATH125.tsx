import type { Need } from '../../interfaces/need/Need';
import type Section from '../../interfaces/section/Section';
import type {SectionDetails} from '../../interfaces/section/SectionDetails';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import { mockCourseCOSC111 } from '../course/mockCourseCOSC111';
import { mockCourseCOSC121 } from '../course/mockCourseCOSC121';
import { mockCourseMATH125 } from '../course/mockCourseMATH125';


export const mockSectionMATH125Details : SectionDetails = {
    id: mockCourseMATH125.id,
    sectionId: 89,
    name: mockCourseMATH125.name,
    deptCode : mockCourseMATH125.deptCode,
    courseNum : mockCourseMATH125.courseNum,
    section: "001",
    term : "Winter 2023",
    type : "Lecture"
}

export const mockSectionScheduleMATH125ForTue : SectionSchedule = {
    sectionId: 1,
    day: "Tue",
    startTime : "13:00",
    endTime: "15:00"
}

export const mockSectionScheduleMATH125ForFri : SectionSchedule = {
    sectionId: 1,
    day: "Fri",
    startTime : "13:00",
    endTime: "15:00"
}

export const mockSectionNeedMATH125 :Need = {
    sectionId: mockSectionMATH125Details.id,
    description: "I need smart people. I need them to be able to do somersaults 10 times consecutively within 10 seconds. If they cannot do this, I will not accept them as a TA for the course and resign from my position as instructor.",
    numOfHoursCurrentlyAllocated: 13,
    requiredGradingHours: 12,
    courseNeeds: [mockCourseCOSC111, mockCourseCOSC121]
}


export const mockSectionMATH125 : Section = {
    sectionDetails : mockSectionMATH125Details,
    sectionSchedule : [mockSectionScheduleMATH125ForTue,mockSectionScheduleMATH125ForFri],
    need :     mockSectionNeedMATH125

}