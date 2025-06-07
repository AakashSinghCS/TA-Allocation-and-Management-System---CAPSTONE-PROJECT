import type SectionSchedule from "../../interfaces/section/SectionSchedule";

export async function fetchAllSectionSchedules(sectionId: number):Promise<SectionSchedule[]>{
    // const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    const baseUrl = 'mock';

    const res = await fetch(`${baseUrl}/mock/mock/mock/${sectionId}`,{
        headers: {
            Accept: 'application/json'
        }
    })
    
    if (!res.ok) {
        throw new Error(`Failed to fetch section details (HTTP ${res.status})`);
    }

    return res.json() as Promise<SectionSchedule[]>;
}