import type User from "./User";

export interface Student extends User{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentNumber: number;
  program: string;
  enrollmentYear: number;
  schoolYear: number;
  createdAt: Date;
}

export const studentProfileFields: (keyof Student)[] = [
  "firstName",
  "lastName",
  "email",
  "studentNumber",
  "program",
  "enrollmentYear",
  "schoolYear",
  "createdAt"
];

export const studentFieldLabels: Record<keyof Student, string> = {
  id:              "User Id",
  firstName:       "First Name",
  lastName:        "Last Name",
  email:           "Email",
  studentNumber:   "Student #",
  program:         "Program",
  enrollmentYear:  "Enrollment Year",
  schoolYear:      "School Year",
  createdAt:       "Registered",
};