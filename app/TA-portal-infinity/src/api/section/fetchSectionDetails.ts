import type { SectionDetails } from "../../interfaces/section/SectionDetails";

export async function fetchSectionDetails(sectionId: number):Promise<SectionDetails>{
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

    return res.json() as Promise<SectionDetails>;
}