export interface Semester {
  id?: number;
  year: number;
  semester: "W1" | "W2" | "S1" | "S2";
  startDate: string;
  endDate: string;
}

export type SemesterCreate = Omit<Semester, 'id'>;
export type SemesterUpdate = Semester;
