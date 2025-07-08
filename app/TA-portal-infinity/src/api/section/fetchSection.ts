import type Section from "../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../mocked-objects/mockSectionCOSC111";

export async function fetchSection(sectionId: number): Promise<Section> {

//    const baseUrl = 'mock';
       
//     const res = await fetch(`${baseUrl}/mock/mock/mock/${studentId}`,{
//         headers: {
//             Accept: 'application/json'
//         }
//     })
    
//     if (!res.ok) {
//         throw new Error(`Failed to fetch student details (HTTP ${res.status})`);
    // }

    // return res.json() as Promise<Section>;
    return mockSectionCOSC111; //delete when backend is implemented
}