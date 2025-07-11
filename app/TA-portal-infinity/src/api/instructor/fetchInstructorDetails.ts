
const BASE = "http://localhost:8080/instructors";

export async function fetchInstructorDetails<Instructor>(userId: number): Promise<Instructor> {
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
    console.log(data);
    return data as Instructor;
    // return mockInstructorChed;

  } catch (err) {
    console.error("Failed to fetch user details:", err);
    return ({} as Instructor);
    // return mockInstructorChed;
  }
}
