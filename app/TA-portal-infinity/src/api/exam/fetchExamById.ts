import type { ExamDto } from "../../interfaces/exam/Exam";

export async function fetchExamById(examId: number, token: string): Promise<ExamDto | null> {
  try {
    const res = await fetch(`http://localhost:8080/exams/${examId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch exam:", res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Error fetching exam:", err);
    return null;
  }
}
