import type Section from "../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../mocked-objects/section/mockSectionCOSC111";
import { mockSectionCOSC121 } from "../../mocked-objects/section/mockSectionCOSC121";

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
      ? Array(6).fill(mockSectionCOSC121)
      : Array(6).fill(mockSectionCOSC121);
  } catch (err) {
    // fallback to mock on error
    return hasCompletedFilter
      ? Array(6).fill(mockSectionCOSC121)
      : Array(6).fill(mockSectionCOSC121);
  }
}
