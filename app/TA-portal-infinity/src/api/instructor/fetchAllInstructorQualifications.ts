import type Qualification from "../../interfaces/qualification/Qualification";
import type Section from "../../interfaces/section/Section";
import { mockInstructorQualificationResponse } from "../../mocked-objects/qualification/mockInstructorQualificationResponse";

export interface QualificationResponse {
    section: Section;
    qualifications: Qualification[];
}

export async function fetchAllInstructorQualifications(instructorId : number): Promise<QualificationResponse[] | null> {
    const BASE = "http://localhost:8080/mock/mock";
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
            // return null;
            return mockInstructorQualificationResponse;
        }
        return res.json();
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        return mockInstructorQualificationResponse;
        // return null;
    }
}