export async function fetchAllStudentQualifications(studentId: number): Promise<number[] | null> {
  const BASE = `http://localhost:8080/qualifications/findByStudentId/${studentId}`;
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
    // return [1];
    }
    return res.json();
  } catch (err) {
    console.error("Something went wrong:", err);
    return null;
    // return [1];
  }
}

