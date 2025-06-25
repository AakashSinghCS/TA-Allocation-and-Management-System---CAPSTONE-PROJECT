import type User from "../../interfaces/user/User";
import { mockStudentEmmaDoe, mockStudentJohnDoe } from "../../mocked-objects/user/mockStudents";

const BASE = "http://localhost:8080/users/search";

interface UserSearchRequest {
  role: string;
  name: string;
  universityNumber: number;
}

export async function fetchAllSearchedUsers<T extends User>(req: UserSearchRequest): Promise<T[] | null> {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams({
    role: req.role,
    name: req.name,
    universityNumber: req.universityNumber.toString(),
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
