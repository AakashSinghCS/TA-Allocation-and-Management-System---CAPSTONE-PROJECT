import type { ProfileQuestion } from "../../interfaces/question/ProfileQuestion";
import { mockTaProfileQuestion1, mockTaProfileQuestion2, mockTaProfileQuestion3 } from "../../mocked-objects/profile/mockTaProfileQuestions";

export async function fetchAllProfileQuestions(): Promise<ProfileQuestion[] | null> {
  const BASE = "http://localhost:8080/admin/questions";
  const token = localStorage.getItem("token");

  try{
    const res = await fetch(BASE, {
      method: "GET",
      headers: { "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
       },      
    });
        if (!res.ok) {
      console.error("Request failed with status:", res.status);
      return null;
    }
      return res.json();
  }catch{
    console.log("something went wrong");
    //TODO: remove the mock after development is finished.
    return [mockTaProfileQuestion1, mockTaProfileQuestion2,mockTaProfileQuestion3];
// return null;
  }
}