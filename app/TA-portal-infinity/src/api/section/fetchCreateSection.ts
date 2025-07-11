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

export async function fetchCreateSection(req:SectionAddDtoRequest ): Promise<boolean | null> {
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
      console.error("Request failed with status:", res.status);
      return null;
    }
    return res.ok;
  } catch {
    console.log("something went wrong");
    return null;
  }
}