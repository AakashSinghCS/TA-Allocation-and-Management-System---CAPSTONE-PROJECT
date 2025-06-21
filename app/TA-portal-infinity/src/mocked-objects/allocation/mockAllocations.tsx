import type { Allocation } from "../../interfaces/allocation/Allocation";
import { mockStudentJohnDoe,mockStudentEmmaDoe } from "../user/mockStudents";

export const mockAllocationJohnDoe : Allocation= {
    id:79,
    student: mockStudentJohnDoe,
    isConfirmed: true,
    numberOfHours: 6,
    // section: mockSectionCOSC121
}

export const mockAllocationEmmaDoe : Allocation= {
    id:79,
    student: mockStudentEmmaDoe,
    isConfirmed: true,
    numberOfHours: 6,
    // section: mockSectionCOSC121
}