import type { EnrollmentStatus } from "../../../interfaces/course/CourseEnrollment";

interface EnrollRequest {
    studentId: number;
    courseId : number;
    sectionId?: number;
    status: EnrollmentStatus;
    grade? : number;
    classAvg?: number;
}

export interface EnrollResponse {
  success: boolean;
  message?: string;   // carries the error body if any
}

export async function fetchEnrollStudent( req: EnrollRequest):Promise<EnrollResponse>{
    const BASE = `http://localhost:8080/enrollments`;
    const token = localStorage.getItem("token");
    console.log(req);
    try {
        const res = await fetch(BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(req),
        });
        if (!res.ok) {
      // Spring usually returns JSON; fall back to text
      let msg: string;
        try {
            const data = await res.json();
            msg = data.message ?? JSON.stringify(data);
        } catch {
            msg = await res.text();
        }
        return { success: false, message: msg };
        }
        return { success: true };
    } catch (err){
        //TODO: remove the mock after development is finished.
        // return mockCreateQualificationResponse;
        return { success: false, message: (err as Error).message };
        // return null;
    }
}