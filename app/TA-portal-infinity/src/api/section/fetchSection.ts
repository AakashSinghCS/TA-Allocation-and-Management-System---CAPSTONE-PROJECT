// src/api/section/fetchSection.ts

import { fetchGetSectionSchedules } from "./sectionschedule/fetchGetSectionSchedule";
import { fetchInstructorDetails } from "../instructor/fetchInstructorDetails";

import type { Instructor } from "../../interfaces/user/Instructor";
import { mapDtoToSection, type SectionDtoWithInstructorId } from "../../utility/convertdtotosection/mapDtoToSection";
import type Section from "../../interfaces/section/Section";
import type SectionSchedule from "../../interfaces/section/SectionSchedule";

export async function fetchSection(
  sectionId: number
): Promise<Section | null> {
  const BASE = `http://localhost:8080/sections/getIncludeInstructorId/${sectionId}`;
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
      console.error("Section fetch failed:", res.status);
      return null;
    }
    const dto: SectionDtoWithInstructorId = await res.json();
    const schedules: SectionSchedule[] | null = await fetchGetSectionSchedules( sectionId);

    let instructor: Instructor | null = null;
    if (dto.instructorId != null) {
      instructor = await fetchInstructorDetails(dto.instructorId);
    }

    return mapDtoToSection(dto, schedules ?? [], instructor);
  } catch (err) {
    console.error("Error in fetchSection:", err);
    return null;
  }
}
