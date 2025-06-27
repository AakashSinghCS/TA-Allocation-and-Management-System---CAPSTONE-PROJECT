import type { Course } from "../../interfaces/course/Course";
import { mockCourseCOSC111 } from "../../mocked-objects/course/mockCourseCOSC111";
import { mockCourseMATH125 } from "../../mocked-objects/course/mockCourseMATH125";


export async function fetchSubmitStudentQualifications( studentId: number, qualifications: number[] ):Promise<boolean>{
const baseUrl = 'mock'; // Replace with real base URL later
  const url = `${baseUrl}/mock/sections/students/${studentId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.json();

    // fallback to mock
    return true;
  } catch (err) {
    // fallback to mock on error
    return true;
  }

}