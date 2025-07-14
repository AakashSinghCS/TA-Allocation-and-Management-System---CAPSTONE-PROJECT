import type { UserRole } from "../../interfaces/enum/UserRole";
import type { StudentOrInstructorOrCoordinator } from "../../interfaces/user/User";


export async function fetchChangeRole(
  userId: number,
  roles: UserRole[]
): Promise<StudentOrInstructorOrCoordinator> {

  const token = localStorage.getItem("token");
  const resp = await fetch(`http://localhost:8080/users/changeRole/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ roles })
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch change roles: ${resp.status}`);
  }

  return await resp.json();
}
