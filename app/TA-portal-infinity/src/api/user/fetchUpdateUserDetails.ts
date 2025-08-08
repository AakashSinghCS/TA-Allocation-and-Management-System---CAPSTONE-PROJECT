import type { UserRole } from "../../interfaces/enum/UserRole";
import type User from "../../interfaces/user/User";

const BASE = "http://localhost:8080/users/update";

export async function fetchUpdateUserDetails<T extends User>(
  id: number,
  updates: Partial<T>,
  loggedInUserId: number,
  loggedInUserRoles: UserRole[] // <- fix here: plural + array
): Promise<string> {
  const token = localStorage.getItem("token");
  const roles = ['COORDINATOR', 'ADMIN'];
  // const prefixedRoles = roles.map(role => `ROLE_${role}`);
  // console.log(prefixedRoles);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Update failed", res.status, text);
    throw new Error(`Update failed: ${res.status} : ${text}`);
  }

  return await res.text();
}
