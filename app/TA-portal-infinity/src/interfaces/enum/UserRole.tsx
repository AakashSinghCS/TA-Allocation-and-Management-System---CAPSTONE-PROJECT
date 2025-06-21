
export const UserRole = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
  COORDINATOR: 'COORDINATOR',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
