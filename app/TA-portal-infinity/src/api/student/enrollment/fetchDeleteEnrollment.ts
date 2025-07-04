export interface EnrollResponse {
  success: boolean;
  message?: string;   // carries the error body if any
}


export async function fetchDeleteEnrollment(studentId : number): Promise<EnrollResponse> {
  const BASE = `http://localhost:8080/enrollments/${studentId}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(BASE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      let msg: string;
        try {
            const data = await res.json();
            msg = data.message ?? JSON.stringify(data);
        } catch {
            msg = await res.text();
        }
        return { success: false, message: msg };
        }
        return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}