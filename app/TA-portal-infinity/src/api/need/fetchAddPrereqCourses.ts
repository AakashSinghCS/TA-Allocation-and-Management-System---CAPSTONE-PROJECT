import type { Course } from "../../interfaces/course/Course";

export async function fetchAddPrereqCourses(courses : Course[]): Promise<boolean | null> {
    const BASE = `http://localhost:8080/needs/adda`;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) {
            console.error("Request failed with status:", res.status);
            // return null;
            // return mockCreateQualificationResponse;
            // return [mockCourseCOSC111];
            return false;
        }
        return res.json();
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        // return mockCreateQualificationResponse;
        // return null;
        return false;
    }
}

