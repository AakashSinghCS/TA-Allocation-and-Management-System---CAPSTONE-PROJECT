import type { SectionDetails } from "../section/SectionDetails";
import type { Student } from "../user/Student";
import type { Course } from "./Course";

export interface CourseEnrollment {
    grade : number;
    classAverage: number;
    course: Course;
}

export interface CourseActive {
    course : Course;
    section : SectionDetails;
    classAverage : number;
}

export interface CourseEnrollmentOverview {
    student?: Student;
    currentCourses?: CourseActive[];
    completedCourses?:CourseEnrollment[];
}

export type EnrollmentStatus = "ENROLLED"| "COMPLETED" | "DROPPED"