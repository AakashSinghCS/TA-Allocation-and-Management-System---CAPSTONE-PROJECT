// Step 1: Import the necessary TypeScript interfaces.
// The paths are relative to the new file's location.
import type Section from '../../interfaces/section/Section';
import type { SectionDetails, SectionType } from '../../interfaces/section/SectionDetails';

/**
 * Defines the structure of the filter data we expect to receive.
 */
interface CourseFilterData {
  term: string;
  searchQuery: string; // This will be used for the course name.
  deptCode: string;
  type: string;
}

/**
 * Takes filter data, maps it to the Section interface, and POSTs it to the API.
 * This function is exported so it can be used from UI components.
 *
 * @param filters - The data object from the course filter form.
 * @returns A promise that resolves when the operation is complete.
 */
export async function postSectionByFilter(filters: CourseFilterData): Promise<void> {

  // Step 2: Transform the filter data into the required SectionDetails structure.
  const sectionDetailsData: SectionDetails = {
    // NOTE: These fields are not in the filter. You must decide how to source them.
    // They are placeholders for now.
    id: 0,
    courseNum: "000", // e.g., "111" from "COSC 111"
    section: "000",   // e.g., "001", "L01"

    // These fields come directly from the filter data.
    name: filters.searchQuery,
    deptCode: filters.deptCode,
    term: filters.term,
    type: filters.type as SectionType, // Cast string to the specific SectionType
  };

  // Step 3: Create the main Section object to be sent in the request body.
  // As requested, sectionSchedule is an empty array.
  const sectionPayload: Section = {
    sectionDetails: sectionDetailsData,
    sectionSchedule: [],
  };

  // Step 4: Define the API endpoint and send the data.
  // IMPORTANT: Replace this URL with your actual backend API endpoint.
  const apiEndpoint = 'http://localhost:5173/courses';

  console.log('Sending data to API:', JSON.stringify(sectionPayload, null, 2));

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sectionPayload), // Convert the object to a JSON string
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('API call successful. Response:', responseData);

  } catch (error) {
    console.error('Failed to post section data:', error);
    // Here you could add logic to show an error message to the user.
  }
}