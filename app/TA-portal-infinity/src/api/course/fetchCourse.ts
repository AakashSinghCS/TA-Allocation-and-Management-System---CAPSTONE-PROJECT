import type { Course } from "../../interfaces/course/Course";

export async function fetchCourse(courseId : number): Promise<Course| null> {
    const BASE = `http://localhost:8080/courses/${courseId}`;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(BASE, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!res.ok) {
            console.error("Request failed with status:", res.status);
            return null;
        }
        return res.json();
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        // return ["COSC","MATH"];
        return null;
    }
}