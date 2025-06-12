import { mockTaProfileQuestions } from '../../mocked-objects/mockTaProfileQuestions';
import type { ProfileQuestion } from '../../interfaces/question/ProfileQuestion';

export async function fetchAllStudentQuestions(studentId: number): Promise<ProfileQuestion[]> {
  const baseUrl = 'mock'; // to be replaced when backend is ready
  const url = `${baseUrl}/mock/questions/students/${studentId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.json();

    if (Array.isArray(data)) return data;

    // Fallback if data is malformed
    return [mockTaProfileQuestions, mockTaProfileQuestions];
  } catch (err) {
    // Fallback on error
    return [mockTaProfileQuestions, mockTaProfileQuestions];
  }
}
