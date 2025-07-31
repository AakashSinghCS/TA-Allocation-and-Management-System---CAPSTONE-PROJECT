import type { Semester } from "../../interfaces/semester/Semester";

/**
 * Get semester date ranges from the API
 * GET localhost:8080/semesters/getAll
 */
export async function getSemesterDates(token: string): Promise<Record<string, { start: string; end: string }>> {
  const response = await fetch(`http://localhost:8080/semesters/getAll`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch semesters: ${response.statusText}`);
  }

  const semesters: Semester[] = await response.json();
  
  // Convert to the format expected by the schedule utilities
  const semesterRanges: Record<string, { start: string; end: string }> = {};
  
  semesters.forEach(semester => {
    const key = `${semester.year}-${semester.semester}`;
    semesterRanges[key] = {
      start: semester.startDate,
      end: semester.endDate
    };
  });

  return semesterRanges;
}
