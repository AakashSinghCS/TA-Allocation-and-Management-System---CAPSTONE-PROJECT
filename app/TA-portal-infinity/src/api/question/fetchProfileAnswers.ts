import type { ProfileQuestion } from "../../interfaces/question/ProfileQuestion";

export async function fetchProfileAnswers(profileId: number): Promise<ProfileQuestion[] | null> {
  const BASE = `http://localhost:8080/profiles/${profileId}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(BASE, {
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
    
    const data = await res.json();
    
    //  the API response to match ProfileQuestion structure
    if (data && data.profileAnswers) {
      return data.profileAnswers.map((answer: any) => ({
        id: answer.id,
        type: answer.type,
        description: answer.description,
        answers: answer.answers.map((opt: any) => ({
          id: opt.id,
          description: opt.description,
        })),
      }));
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching profile answers:", error);
    return null;
  }
}
