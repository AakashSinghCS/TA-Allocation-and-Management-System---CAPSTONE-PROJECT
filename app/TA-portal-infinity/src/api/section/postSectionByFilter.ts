import type { Course } from '../../interfaces/course/Course'; // Assuming CourseSectionDto matches Course structure

// Defines the structure for the filter data from the UI.

interface CourseFilterData {
  term: string;
  searchQuery: string;
  deptCode: string;
  type: string;
}


// Defines the structure for the backend request.
// Based on `CourseFilterRequest.java` DTO.
 
interface CourseFilterRequest {
  term: string;
  name: string; // Backend expects `name` for the search query
  deptCode: string;
  // `type` is part of the filter UI but not in the backend DTO,
  // so we omit it from the request.
  // We can add it to the backend DTO if filtering by type is needed.
}

// Fetches courses from the backend based on filter criteria.
// @param filters - The data object from the course filter form.
// @returns A promise that resolves to an array of courses.


export async function fetchFilteredCourses(filters: CourseFilterData): Promise<Course[]> {
  // 1. Correct API endpoint for the backend gateway and service
  const apiEndpoint = 'http://localhost:8080/courses/filterCourses';

  // 2. Create a payload that matches the backend's `CourseFilterRequest` DTO
  const requestPayload: CourseFilterRequest = {
    term: filters.term || null, // Send null if empty, so backend can ignore it
    name: filters.searchQuery || null,
    deptCode: filters.deptCode || null,
  };

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST', // Matches the @PostMapping on the backend
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }

    // The backend returns a list of courses, so we return that.
    return await response.json() as Course[];

  } catch (error) {
    console.error('Failed to fetch filtered courses:', error);
    // Return an empty array in case of an error to prevent the app from crashing
    return [];
  }
}