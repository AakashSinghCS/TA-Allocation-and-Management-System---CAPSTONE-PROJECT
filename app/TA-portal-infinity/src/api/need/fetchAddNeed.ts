import type { Course } from "../../interfaces/course/Course";
import type Section from "../../interfaces/section/Section";


interface FetchAddNeedProps {
    section : Section,
    description: string,
    requiredGradingHours : number,
    prereqCourses : Course[];
}

export async function fetchAddNeed({section, description, requiredGradingHours, prereqCourses}:FetchAddNeedProps ): Promise<boolean | null> {
    const BASE = `http://localhost:8080/needs/add/${section.sectionDetails?.id}`;
    const token = localStorage.getItem("token");

    const needRequest = {
        description: description,
        requiredGradingHours : requiredGradingHours,
        numHoursCurrentlyAllocated : 0,
        year: section.sectionDetails?.year,
        semester : section.sectionDetails?.semester
    }
    console.log(needRequest);
    try {
        const res = await fetch(BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(needRequest),
        });
        if (!res.ok) {
            console.error("Request failed with status:", res.status);
            // return null;
            // return mockCreateQualificationResponse;
            return false;
        }
        return res.ok
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        // return mockCreateQualificationResponse;
        return false;
        // return null;
    }
}

