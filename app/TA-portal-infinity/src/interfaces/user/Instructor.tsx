import type User from "./User";

export interface Instructor extends User{
    department? : string;
    employeeNumber? : string;
}

export const instructorProfileFields: (keyof Instructor)[] = [
  "id",
  "firstName",
  "lastName",
  "email",
  "department",
  "employeeNumber",
  "createdAt"
];

export const instructorFieldLabels: Record<keyof Instructor, string> = {
  id:              "User Id",
  firstName:       "First Name",
  lastName:        "Last Name",
  email:           "Email",
  department:      "Department",
  employeeNumber:     "Employee Number",
  createdAt:       "Registered",
};