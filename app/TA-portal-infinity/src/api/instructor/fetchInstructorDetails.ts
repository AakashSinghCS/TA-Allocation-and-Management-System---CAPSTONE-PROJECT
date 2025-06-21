import type { Instructor } from "../../interfaces/user/Instructor";
import { mockInstructorChed } from "../../mocked-objects/user/mockInstructorChed";

export async function fetchInstructorDetails(instructorId: number): Promise<Instructor> {
  const baseUrl = 'mock'; // temporary value until backend is wired
  const url = `${baseUrl}/mock/mock/instructors/${instructorId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    // We expect the test to stub the response here
    const data = await res.json();

    // If this is a test, data will be `{ student: mockStudentJohnDoe }`
    if (data && data.instructors) {
      return data.instructors;
    }

    // fallback to mock if malformed
    return mockInstructorChed;
  } catch (err) {
    // fallback to mock on fetch failure
    return mockInstructorChed;
  }
}
