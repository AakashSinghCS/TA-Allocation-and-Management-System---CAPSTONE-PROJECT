import type SectionHasCompleted from "../../interfaces/section/SectionHasCompleted";

export async function fetchAllStudentSections(studentId: number): Promise<SectionHasCompleted[]> {

    const baseUrl = 'mock';
    
    const res = await fetch(`${baseUrl}/mock/mock/mock/${studentId}`,{
        headers: {
            Accept: 'application/json'
        }
    })
    
    if (!res.ok) {
        throw new Error(`Failed to fetch student details (HTTP ${res.status})`);
        
    }

    return res.json() as Promise<SectionHasCompleted[]>;
}