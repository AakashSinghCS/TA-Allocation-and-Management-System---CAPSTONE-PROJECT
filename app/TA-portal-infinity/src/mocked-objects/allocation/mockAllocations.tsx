import type { Allocation } from "../../interfaces/allocation/Allocation";
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

export const mockAllocation : Allocation = {
    id: 2,
    student: mockStudentJohnDoe,
    labPrepHours: 0,
    gradingHours: 0,
    application:{
        id:1,
        applicationId:1,
        student:{
             id : 1,
            firstName : "John",
            lastName : "Doe",
            studentNum : "12345678",
            program : "Computer Science",
            enrollmentYear : 2021,
            schoolYear: "3",
        },
        preferences: ["COSC"],
        wantRemote: false,
        wantWorkingHours: 5,
        timeSubmitted: "14:00",
        applicationType: 'GRADUATE',
        unavailabilities: []
    },
    allocatedSections: [
                {
            id: 2,
            sectionId: 1,
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
            task: "GRADING",
            hours: 2
        },
    ] 
}