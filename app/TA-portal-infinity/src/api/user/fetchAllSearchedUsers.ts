import type User from "../../interfaces/user/User";
import { mockStudentEmmaDoe, mockStudentJohnDoe } from "../../mocked-objects/user/mockStudents";

const BASE = "http://localhost:8080/users/search";

interface UserSearchRequest {
  role?: string;
  firstname?: string;
  lastname?: string;
  universityNumber?: number;
  userId? : string;
}

export async function fetchAllSearchedUsers<T extends User>(req: UserSearchRequest): Promise<T[] | null> {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams({
    ...(req.role ? { role: req.role }: {}),
    ...(req.firstname ? { firstname: req.firstname }: {}),
    ...(req.lastname ? { lastname: req.lastname }: {}),
    ...(req.universityNumber ? { universityNumber: req.universityNumber.toString() }: {}),
    ...(req.userId ? { userId: req.userId }: {})
  });

  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      console.error("Request failed with status:", res.status);
      return [mockStudentJohnDoe, mockStudentEmmaDoe] as unknown as T[];
    }

    return await res.json();
  } catch (err) {
    console.error("Something went wrong:", err);
    return [mockStudentJohnDoe, mockStudentEmmaDoe] as unknown as T[];
  }
}
