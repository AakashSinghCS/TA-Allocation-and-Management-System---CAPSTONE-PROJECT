export interface Course {
  id: number;
  name: string;
  deptCode: string;
  courseNum: string;
  section: string;
  term: string;
  type: string;
  instructorId: number;
  prerequisites: string[];
}