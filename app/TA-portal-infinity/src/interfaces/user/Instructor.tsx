import type User from "./User";

export interface Instructor extends User{
    dept? : string;
    employeeNum? : string;
}

export const instructorProfileFields: (keyof Instructor)[] = [
  "id",
  "firstName",
  "lastName",
  "email",
  "dept",
  "employeeNum",
  "createdAt"
];

export const instructorFieldLabels: Record<keyof Instructor, string> = {
  id:              "ID",
  firstName:       "First Name",
  lastName:        "Last Name",
  email:           "Email",
  dept:      "Department",
  employeeNum:     "Employee Number",
  roles :          "Roles",
  createdAt:       "Registered",
};