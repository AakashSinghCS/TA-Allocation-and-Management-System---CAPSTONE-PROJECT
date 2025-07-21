import type Section from "../../interfaces/section/Section";
import type { SectionProfile } from "../../interfaces/section/Section";

export async function fetchUpdateSectionDetails(sectionId: number,req: Section): Promise<boolean | null> {
  const token = localStorage.getItem("token");
  const BASE = `http://localhost:8080/sections/updateSection/${sectionId}`;

  try {
    const res = await fetch(BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),
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