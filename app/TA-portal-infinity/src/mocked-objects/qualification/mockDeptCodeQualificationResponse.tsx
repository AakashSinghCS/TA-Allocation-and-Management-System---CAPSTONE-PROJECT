import type { DeptCodeQualificationResponse } from "../../api/student/fetchAllDeptCodeQualifications";
import { mockCourseCOSC111 } from "../course/mockCourseCOSC111";
import { mockCourseCOSC121 } from "../course/mockCourseCOSC121";
import { mockQualificationCOSC111, mockQualificationCOSC121 } from "./mockQualifications";

export const mockDeptCodeQualificationResponse : DeptCodeQualificationResponse[]= [
    {
        qualification: mockQualificationCOSC111[0],
        course: mockCourseCOSC111
    },
    {
        qualification: mockQualificationCOSC121[0],
        course: mockCourseCOSC121
    },
    {
        qualification: mockQualificationCOSC111[1],
        course: mockCourseCOSC111
    }
];


/*
example:
export const mockStudentQualificationResponse : StudentQualificationResponse[]= [
    {
        qualification: {
            id: 1, description: "needs to be able to do 10 somersaults consecutively", deptCode: "COSC"
        },
        course:{
            id: 1,
            name: "Introduction to Computer Science",
            deptCode : "COSC",
            courseNum : "111",
        }
    },
    {
        qualification: {
            id: 2, description: "needs to speak 10 languages", deptCode: "COSC"
        },
        course: {
            id: 1,
            name: "Introduction to Computer Science",
            deptCode : "COSC",
            courseNum : "111",
        }
    }
];
*/