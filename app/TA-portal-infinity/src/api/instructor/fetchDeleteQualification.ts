

export async function fetchDeleteQualification(qualificationId: number): Promise<boolean> {
  const BASE = `http://localhost:8080/qualifications/instructor/deleteQualification/${qualificationId}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(BASE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      return true;
    } else {
      console.error("Request failed with status:", res.status);
      return false;
    }
  } catch (err) {
    console.error("Something went wrong:", err);
    return false;
  }
}