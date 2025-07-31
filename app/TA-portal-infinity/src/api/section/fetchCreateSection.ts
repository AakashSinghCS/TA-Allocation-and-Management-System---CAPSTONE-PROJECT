import type { SectionType } from "../../interfaces/section/SectionDetails";
import type SectionSchedule from "../../interfaces/section/SectionSchedule";

const BASE = "http://localhost:8080/sections/add";

export interface SectionAddDtoRequest{
    deptCode? : string | undefined;
    name ?: string | undefined;
    courseNum? : string | undefined;
    section?: string | null;
    type? : SectionType | null;
    year ?: number | null;
    semester?: string | null;
    sectionSchedules? :SectionSchedule[] | null;
    instructorId? : number | null;
}

export async function fetchCreateSection(req: SectionAddDtoRequest): Promise<{ success: boolean, error?: string } | null> {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      let errorMsg = "";
      try {
        const data = await res.json();
        errorMsg = data?.message || data?.error || JSON.stringify(data);
      } catch {
        errorMsg = await res.text();
      }
      return { success: false, error: errorMsg };
    }
    return { success: true };
  } catch (e) {
    console.log("something went wrong", e);
    return { success: false, error: "Network or server error" };
  }
}