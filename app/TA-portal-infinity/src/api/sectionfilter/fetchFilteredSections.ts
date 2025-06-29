import type Section from "../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../mocked-objects/section/mockSectionCOSC111";

export interface filterSectionsProps{
    term: string;
    searchQuery: string;
    deptCode: string;
    type: string;
}

export async function fetchFilteredSections(filters: filterSectionsProps): Promise<Section[] | null> {
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
            return [mockSectionCOSC111]
        }
        return res.json();
    } catch {
        console.log("something went wrong");
        //TODO: remove the mock after development is finished.
        return [mockSectionCOSC111]
        // return null;
    }
}