import type { Student } from "../../interfaces/user/Student";
import type User from "../../interfaces/user/User";

const BASE = "http://localhost:8080/users";

export async function fetchUserDetails<T extends User>(userId: number): Promise<T> {
  const url = `${BASE}/${userId}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();
    return data as T;

  } catch (err) {
    console.error("Failed to fetch user details:", err);
    return ({} as T);
  }
}
