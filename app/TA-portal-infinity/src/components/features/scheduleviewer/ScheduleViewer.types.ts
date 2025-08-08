// Types for ScheduleViewer
export type ScheduleRow = {
  id: number;
  course: string;
  section: string;
  instructor: string;
  day: string;
  startTime: string;
  endTime: string;
  status: string;
  semester: string;
  year: number;
  numberOfHours: number;
  date?: string;
};
