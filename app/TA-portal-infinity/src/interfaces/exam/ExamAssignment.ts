export default interface ExamAssignmentDto {
  id: number;
  examId: number;
  studentId: number;
  task: string;
  date: string;
  startTime: string;
  endTime: string;
}
