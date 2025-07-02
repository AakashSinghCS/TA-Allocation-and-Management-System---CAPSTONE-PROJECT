import type { Need } from "../../interfaces/need/Need";
import type { SectionProfile } from "../../interfaces/section/Section";

// interface NeedRequest { 
//     requiredGradingHours : number,
//     numHoursCurrentlyAllocated,
//         Integer year,
//         String semester
// }

export async function fetchUpdateNeed(need : Need): Promise<boolean | null> {
  const token = localStorage.getItem("token");
  const BASE = `http://localhost:8080/needs/update/${need.courseId}/${need.year}/${need.semester}`;

  try {
    const res = await fetch(BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(need),
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