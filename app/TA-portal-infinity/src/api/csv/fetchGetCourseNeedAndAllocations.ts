import type { Course } from "../../interfaces/course/Course";
import type { Need } from "../../interfaces/need/Need";
import type { SectionType } from "../../interfaces/section/SectionDetails";
import type { Student } from "../../interfaces/user/Student";

interface BackendSection {
            id:number;
            year: number;
            semester: string;
            section : string;
            type: SectionType;
            course: Course;
          }

interface Payload {
    section:BackendSection;
    need: Need;
    allocations : {
          id: number;
          student: Student;    
          isConfirmed: boolean;
          numberOfHours: number;
          section: BackendSection
    }[]
}

export async function fetchGetCourseNeedAndAllocations(courseId : number, year: number, semester : string): Promise<Payload | null> {
    const BASE = `http://localhost:8080/courses/needAndAllocations/${courseId}/${year}/${semester}`;
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
            // return ["111"];
        }
        return res.json();
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        // return ["111"];
        return null;
    }
}