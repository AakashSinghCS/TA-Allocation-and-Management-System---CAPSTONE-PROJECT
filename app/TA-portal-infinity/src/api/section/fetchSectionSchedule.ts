// import type SectionSchedule from '../../interfaces/section/SectionSchedule';

// /**
//  * Fetches the schedule array for a given section by sectionId.
//  * @param sectionId The section's unique ID
//  * @param token The user's auth token
//  * @returns Promise<SectionSchedule[]>
//  */
// export async function fetchSectionSchedule(sectionId: number, token: string): Promise<SectionSchedule[]> {
//   const res = await fetch(
//     `http://localhost:8080/sections/getSectionSchedules/${sectionId}`,
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
//   if (!res.ok) {
//     throw new Error(`Failed to fetch section schedule: ${res.status} ${res.statusText}`);
//   }
//   return res.json();
// }
