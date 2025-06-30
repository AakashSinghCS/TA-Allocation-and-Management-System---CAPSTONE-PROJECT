import type Section from "../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../mocked-objects/section/mockSectionCOSC111";
import { mockSectionCOSC121 } from "../../mocked-objects/section/mockSectionCOSC121";
import { mockSectionMATH125 } from "../../mocked-objects/section/mockSectionMATH125";
export async function fetchAllInstructorTeachesSection( instructorId: number): Promise<Section[]> {
  const baseUrl = 'mock'; // Replace with real base URL later
  const url = `${baseUrl}/mock/sections/students/${instructorId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.json();

    // Expecting an array of sections directly from the mock
    if (Array.isArray(data)) return data;

    // fallback to mock
    return [mockSectionCOSC111,mockSectionCOSC121, mockSectionMATH125]
  } catch (err) {
    // fallback to mock on error
    return  [mockSectionCOSC111,mockSectionCOSC121,mockSectionMATH125]
  }
}
