import type Section from "../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../mocked-objects/mockSectionCOSC111";
import { mockSectionCOSC121 } from "../../mocked-objects/mockSectionCOSC121";

export async function fetchAllStudentSectionsHasCompleted(
  studentId: number,
  hasCompletedFilter: boolean
): Promise<Section[]> {
  const baseUrl = 'mock'; // Replace with real base URL later
  const url = `${baseUrl}/mock/sections/students/${studentId}`;

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
    return hasCompletedFilter
      ? [mockSectionCOSC111]
      : Array(10).fill(mockSectionCOSC121);
  } catch (err) {
    // fallback to mock on error
    return hasCompletedFilter
      ? [mockSectionCOSC111]
      : Array(10).fill(mockSectionCOSC121);
  }
}
