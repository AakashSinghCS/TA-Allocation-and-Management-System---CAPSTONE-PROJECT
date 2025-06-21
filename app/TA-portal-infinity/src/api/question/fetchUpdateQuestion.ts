import type { QuestionRequest } from "../../components/features/questionanswer/questionitem/QuestionItem";
import type { ProfileQuestion } from "../../interfaces/question/ProfileQuestion";


const BASE = "http://localhost:8080/admin/questions";


export async function fetchUpdateQuestion(req: QuestionRequest): Promise<ProfileQuestion | null> {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(BASE + "/" + req.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),

    });
    if (!res.ok) {
      console.error("Request failed with status:", res.status);
      return null;
    }
    return res.json();
  } catch {
    console.log("something went wrong");
    return null;
  }
}