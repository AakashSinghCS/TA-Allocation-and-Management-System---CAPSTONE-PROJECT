const BASE = "http://localhost:8080/profiles";

export interface RequestSubmitQuestions {
  answerIds : number[];
  freeTextRequests : {
    questionId : number;
    answerText : string;
  }[];
}

export async function fetchSubmitQuestions(studentId : number, request : RequestSubmitQuestions): Promise<boolean> {
  const url = `${BASE}/${studentId}/answers`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });
    return res.ok;
  } catch (err) {
    console.error("Something went wrong:", err);
    return false;
  }
}

