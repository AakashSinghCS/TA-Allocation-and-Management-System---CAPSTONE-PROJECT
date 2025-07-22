import type ExamAssignmentDto from "../../interfaces/exam/ExamAssignment";

export async function fetchExamAssignmentsByStudentId(studentId: number, token: string): Promise<ExamAssignmentDto[]> {
  const res = await fetch(`http://localhost:8080/exams/assignments/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch exam assignments");
  }

  return await res.json();
}
