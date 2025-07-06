import type { Course } from "../../interfaces/course/Course";
import type Qualification from "../../interfaces/qualification/Qualification";

// export interface QualificationResponse {
//     section: Section;
//     qualifications: Qualification[];
// }

interface QualificationRequest {
    courseId : number;
    description: string;
    deptCode : string;
}

interface Response {
    id: number;
    description: string;
    course: Course;
}

export async function fetchCreateQualification(description : string, deptCode : string, courseId : number): Promise<Qualification | null> {
    const BASE = `http://localhost:8080/qualifications/instructor/addQualification`;
    const token = localStorage.getItem("token");

    // const mockCreateQualificationResponse : Qualification= {
    //     id: Math.floor(Math.random() * 10000),
    //     description: description,
    //     deptCode: deptCode

    const request:QualificationRequest = {
        courseId: courseId,
        description: description,
        deptCode:deptCode
    }

    try {
        const res = await fetch(BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(request)
        });
        if (!res.ok) {
            console.error("Request failed with status:", res.status);
            return null;
            // return mockCreateQualificationResponse;
        }
        const data : Response = await res.json();
        console.log(data);
        return{
            id:data.id, description:data.description, deptCode:data.course.deptCode
        }
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        // return mockCreateQualificationResponse;
        return null;
    }
}

