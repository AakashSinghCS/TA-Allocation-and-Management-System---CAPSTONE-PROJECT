import type { StudentOrInstructorOrCoordinator } from "../../interfaces/user/User";

export async function fetchGraduateApplicants(token: string): Promise<StudentOrInstructorOrCoordinator[]> {
  const res = await fetch("http://localhost:8080/applications/graduateApplicants", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch graduate applicants");
  return await res.json();
}

export async function getGraduateApplication(studentId: number, year: number, semester: string, token: string) {
  const res = await fetch(`http://localhost:8080/applications/get/${studentId}/${year}/${semester}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Student does not have a graduate application submitted.");
  return await res.json();
}

