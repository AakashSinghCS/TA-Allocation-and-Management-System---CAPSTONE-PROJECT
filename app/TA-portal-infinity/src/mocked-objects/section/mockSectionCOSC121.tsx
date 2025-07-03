import type Section from '../../interfaces/section/Section';
import type {SectionDetails} from '../../interfaces/section/SectionDetails';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import { mockCourseCOSC121 } from '../course/mockCourseCOSC121';
import type { Need } from '../../interfaces/need/Need';
import { mockCourseCOSC111 } from '../course/mockCourseCOSC111';
import {mockCourseMATH125} from '../course/mockCourseMATH125'
import { mockAllocationEmmaDoe, mockAllocationJohnDoe } from '../allocation/mockAllocations';
import { mockInstructorChed } from '../user/mockInstructorChed';

export const mockSectionCOSC121Details : SectionDetails = {
    id: mockCourseCOSC121.id,
    sectionId: 91,
    name: mockCourseCOSC121.name,
    deptCode : mockCourseCOSC121.deptCode,
    courseNum : mockCourseCOSC121.courseNum,
    section: "001",
    semester : "W1",
    type : "LECTURE",
    year: 2025
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

export const mockSectionNeedCOSC121 :Need = {
    description: "I need smart people",
    numHoursCurrentlyAllocated: 12,
    requiredGradingHours: 12,
    prerequisites: [mockCourseCOSC111, mockCourseMATH125]
}


export const mockSectionCOSC121 : Section = {
    sectionDetails : mockSectionCOSC121Details,
    sectionSchedule : [mockSectionScheduleCOSC121ForWed,mockSectionScheduleCOSC121ForThu],
    need: mockSectionNeedCOSC121,
    allocations: [mockAllocationJohnDoe,mockAllocationEmmaDoe,mockAllocationEmmaDoe,mockAllocationEmmaDoe],
    instructor: mockInstructorChed
}