import type { Instructor } from '../../../interfaces/user/Instructor';

export async function fetchInstructorById(instructorId: number): Promise<Instructor | null> {
  const BASE = `http://localhost:8080/users/instructors/${instructorId}`;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      console.error('Instructor fetch failed:', res.status);
      return null;
    }
    const instructor: Instructor = await res.json();
    return instructor;
  } catch (err) {
    console.error('Error in fetchInstructorById:', err);
    return null;
  }
}
