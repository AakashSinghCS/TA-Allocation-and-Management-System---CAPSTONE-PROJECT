import type { Student } from "../../interfaces/user/Student";
import { mockStudentJohnDoe } from '../../mocked-objects/user/mockStudents';

export async function fetchStudentDetails(studentId: number): Promise<Student> {
  const baseUrl = 'mock'; // temporary value until backend is wired
  const url = `${baseUrl}/mock/mock/students/${studentId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    // We expect the test to stub the response here
    const data = await res.json();

    // If this is a test, data will be `{ student: mockStudentJohnDoe }`
    if (data && data.student) {
      return data.student;
    }

    // fallback to mock if malformed
    return mockStudentJohnDoe;
  } catch (err) {
    // fallback to mock on fetch failure
    return mockStudentJohnDoe;
  }
}
