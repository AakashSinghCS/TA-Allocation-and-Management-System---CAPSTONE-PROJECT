import type { ProfileQuestion } from '../../interfaces/question/ProfileQuestion';

const BASE = "http://localhost:8080/profiles";

interface Response {
  profileAnswers: ProfileQuestion[];
}

export async function fetchAllStudentQuestions(id: number): Promise<ProfileQuestion[] | null> {
  const url = `${BASE}/${id}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      console.error("Request failed with status:", res.status);
      return null;
    }
    const response : Response = await res.json();
    return response.profileAnswers;
  } catch (err) {
    console.error("Something went wrong:", err);
    return null;
  }
}

