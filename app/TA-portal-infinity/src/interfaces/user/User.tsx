import type { UserRole } from "../enum/UserRole";

export default interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: UserRole[];
  createdAt?:  string | Date;
}

export interface StudentOrInstructorOrCoordinator extends User{
  studentNum : number;
  program : string;
  enrollmentYear : number;
  schoolYear : number;
  dept : string;
  employeeNum : number;
}

export const userProfileFields: (keyof StudentOrInstructorOrCoordinator)[] = [
  "id",
  "firstName",
  "lastName",
  "email",
  "studentNum",
  "program",
  "enrollmentYear",
  "schoolYear",
  "dept",
  "employeeNum",
  "roles",
  "createdAt"
];

export const userFieldLabels: Record<keyof StudentOrInstructorOrCoordinator, string> = {
  id:              "ID",
  firstName:       "First Name",
  lastName:        "Last Name",
  email:           "Email",
  studentNum:       "Student #",
  program:         "Program",
  enrollmentYear:  "Enrollment Year",
  schoolYear:      "School Year",
  dept:      "Department",
  employeeNum:     "Employee Number",
  roles :          "Roles",
  createdAt:       "Registered",
};