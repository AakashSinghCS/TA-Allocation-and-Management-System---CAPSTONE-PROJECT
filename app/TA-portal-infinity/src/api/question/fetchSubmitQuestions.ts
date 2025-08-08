const BASE = "http://localhost:8080/profiles";

export interface RequestSubmitQuestions {
  answerIds : number[];
  freeTextRequests : {
    questionId : number;
    answerText : string;
  }[];
}

export interface SubmissionError {
  questionId: number;
  message: string;
}

export interface SubmissionResult {
  success: boolean;
  errors?: SubmissionError[];
  message?: string;
}

export async function fetchSubmitQuestions(studentId : number, request : RequestSubmitQuestions): Promise<SubmissionResult> {
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

    if (res.ok) {
      return { success: true };
    } else {
      // error response
      try {
        const errorData = await res.json();
        return {
          success: false,
          message: errorData.message || `Server error: ${res.status} ${res.statusText}`,
          errors: errorData.errors || []
        };
      } catch {
        return {
          success: false,
          message: `Server error: ${res.status} ${res.statusText}`
        };
      }
    }
  } catch (err) {
    console.error("Something went wrong:", err);
    return {
      success: false,
      message: "Network error. Please check your connection and try again."
    };
  }
}

