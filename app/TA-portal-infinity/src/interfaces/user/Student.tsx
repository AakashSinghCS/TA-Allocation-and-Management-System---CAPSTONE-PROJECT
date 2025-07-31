import type User from "./User";

export interface Student extends User{
  studentNum?: number;
  program?: string;
  enrollmentYear?: number;
  schoolYear?: number;
}

export const studentProfileFields: (keyof Student)[] = [
  "id",
  "firstName",
  "lastName",
  "email",
  "studentNum",
  "program",
  "enrollmentYear",
  "schoolYear",
  "createdAt"
];

export const studentFieldLabels: Record<keyof Student, string> = {
  id:              "ID",
  firstName:       "First Name",
  lastName:        "Last Name",
  email:           "Email",
  studentNum:       "Student #",
  program:         "Program",
  enrollmentYear:  "Enrollment Year",
  schoolYear:      "School Year",
  roles :          "Roles",
  createdAt:       "Registered",
  active: "Accounted Enabled"
};