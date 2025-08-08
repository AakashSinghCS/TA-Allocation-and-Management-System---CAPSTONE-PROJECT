const BASE = "http://localhost:8080/sections/assignInstructor";

export async function fetchAssignInstructor(instructorId :number, sectionId : number ): Promise<boolean | null> {
  const token = localStorage.getItem("token");
  
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({instructorId:instructorId, sectionId:sectionId}),
    });
    if (!res.ok) {
      console.error("Request failed with status:", res.status);
      return null;
    }
    return res.ok;
  } catch {
    console.log("something went wrong");
    return null;
  }
}