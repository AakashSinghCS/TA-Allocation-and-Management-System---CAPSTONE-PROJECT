import type { Course } from "../../interfaces/course/Course";
import { mockCourseCOSC111 } from "../../mocked-objects/course/mockCourseCOSC111";
import { mockCourseMATH125 } from "../../mocked-objects/course/mockCourseMATH125";


export async function fetchSubmitStudentQualifications( studentId: number, qualifications: number[] ):Promise<boolean>{
const BASE = `http://localhost:8080/qualifications/${studentId}/studentUpdateQualification`;
const token = localStorage.getItem("token");

const payload = { qualificationIds: qualifications }; 
  try {
    const res = await fetch(BASE, {
      method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      body: JSON.stringify(payload), 
    });

    if(!res.ok) return false;

    return true;
  } catch (err) {

    return true;
  }

}