import type { AllocatedSection, Allocation } from "../../interfaces/allocation/Allocation";
import { mockStudentJohnDoe,mockStudentEmmaDoe } from "../user/mockStudents";

export const mockAllocationJohnDoe : Allocation= {
    id:79,
    student: mockStudentJohnDoe,
    status: 'CONFIRMED',
    // numberOfHours: 6,
    // section: mockSectionCOSC121
}

export const mockAllocationEmmaDoe : Allocation= {
    id:79,
    student: mockStudentEmmaDoe,
    status: 'CONFIRMED',
    // numberOfHours: 6,
    // section: mockSectionCOSC121
}
export const mockAllocatedSections:AllocatedSection[] = [
 {
            id: 2,
            sectionId: 1,
            allocationId: 1,
            task: "LAB_PREP",
            hours: 2.5
        },
        // {
        //     id: 1,
        //     sectionId: 1,
        //     task: "LAB",
        //     hours: 2.5
        // },
        {
            id: 1,
            sectionId: 1,
            allocationId:1,
            task: "GRADING",
            hours: 2
        },
]
export const mockAllocation : Allocation = {
    id: 2,
    student: mockStudentJohnDoe,
    labPrepHours: 0,
    gradingHours: 0,
    application:{
        id:1,
        applicationId:1,
        student:mockStudentJohnDoe,
        preferences: ["COSC"],
        wantRemote: false,
        wantWorkingHours: 5,
        timeSubmitted: "14:00",
        applicationType: 'GRADUATE',
        unavailabilities: []
    },
    allocatedSections: mockAllocatedSections
}

