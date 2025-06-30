import type Section from "../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../mocked-objects/section/mockSectionCOSC111";
import { mockSectionCOSC121 } from "../../mocked-objects/section/mockSectionCOSC121";
import { mockSectionMATH125 } from "../../mocked-objects/section/mockSectionMATH125";

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
   // return the right mock based on sectionId
  if (sectionId === mockSectionCOSC111.sectionDetails?.sectionId) {
    return mockSectionCOSC111;
  }
  if (sectionId === mockSectionCOSC121.sectionDetails?.sectionId) {
    return mockSectionCOSC121;
  }
  if (sectionId === mockSectionMATH125.sectionDetails?.sectionId) {
    return mockSectionMATH125;
  }
  throw new Error(`No mock defined for sectionId ${sectionId}`);
}