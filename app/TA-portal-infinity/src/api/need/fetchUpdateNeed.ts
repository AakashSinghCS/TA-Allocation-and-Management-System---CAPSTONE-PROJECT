import type { Need } from "../../interfaces/need/Need";

// interface NeedRequest { 
//     requiredGradingHours : number,
//     numHoursCurrentlyAllocated,
//         Integer year,
//         String semester
// }

export async function fetchUpdateNeed(need : Need): Promise<boolean | null> {
  const token = localStorage.getItem("token");
  const BASE = `http://localhost:8080/needs/update/${need.courseId}/${need.year}/${need.semester}`;
// const ids = selectedPrereqs.map(c => c?.id ?? -1);
  const uniqueIds = Array.from(new Set(need.prerequisites?.map(c => c.id)));
      
  const needRequest = {
        description: need.description,
        requiredGradingHours : need.requiredGradingHours,
        numHoursCurrentlyAllocated : need.numHoursCurrentlyAllocated,
        year: need.year,
        semester : need.semester,
        prerequisiteCourseIds : uniqueIds
    }
    console.log(needRequest)
  try {
    const res = await fetch(BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(needRequest),
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