import type { Course } from "../../interfaces/course/Course";
import { mockCourseCOSC111 } from "../../mocked-objects/course/mockCourseCOSC111";
import { mockCourseMATH125 } from "../../mocked-objects/course/mockCourseMATH125";


export async function fetchAllCoursesStudentHasCompleted( studentId: number, gradeToAvgPercentage? : number ):Promise<Course[]>{
const baseUrl = 'mock'; // Replace with real base URL later
  const url = `${baseUrl}/mock/sections/students/${studentId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.json();

    // Expecting an array of sections directly from the mock
    if (Array.isArray(data)) return data;

    // fallback to mock
    return [mockCourseMATH125,mockCourseCOSC111]
  } catch (err) {
    // fallback to mock on error
    return [mockCourseMATH125,mockCourseCOSC111]
  }

}