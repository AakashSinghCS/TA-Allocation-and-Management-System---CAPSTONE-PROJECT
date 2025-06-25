import type Qualification from "../../interfaces/qualification/Qualification";
import type Section from "../../interfaces/section/Section";
import { mockQualificationResponse } from "../../mocked-objects/qualification/mockQualificationResponse";

export interface QualificationResponse {
    section: Section;
    qualifications: Qualification[];
}

interface QualificationRequest {
    courseId : number;
    description: string;
    deptCode : string;
}

export async function fetchCreateQualification(description : string, deptCode : string, courseId : number): Promise<Qualification | null> {
    const BASE = "http://localhost:8080/mock/mock";
    const token = localStorage.getItem("token");

    const mockCreateQualificationResponse : Qualification= {
        id: Math.floor(Math.random() * 10000),
        description: description,
        deptCode: deptCode
    }

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
            return mockCreateQualificationResponse;
        }
        return res.json();
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        return mockCreateQualificationResponse;
        // return null;
    }
}

