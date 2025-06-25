import type User from "../../interfaces/user/User";
import { mockStudentEmmaDoe, mockStudentJohnDoe } from "../../mocked-objects/user/mockStudents";

const BASE = "http://localhost:8080/mock/mock";

interface UserSearchRequest {
  role : string;
  name: string;
  universityNumber : number;
}

export async function fetchAllSearchedUsers<T extends User>(req: UserSearchRequest): Promise<T[] | null> {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),

    });
    if (!res.ok) {
      console.error("Request failed with status:", res.status);
      // return null;
      return [mockStudentJohnDoe, mockStudentEmmaDoe] as unknown as T[];;

    }
    return res.json();
  } catch {
    console.log("something went wrong");
    // return null;
    return [mockStudentJohnDoe, mockStudentEmmaDoe] as unknown as T[];;
  }
}