import type { Course } from "../course/Course"

export type SectionType =
    | "LECTURE"
    | "TUTORIAL"
    | "LABORATORY"
    | "DISCUSSION"
    | "SEMINAR"
    | "WORKSHOP"
    | "EXPERENTIAL"
    | "INDEPENDENT_STUDY"

export interface SectionDetails extends Course{
    sectionId?: number,
    semester?: string,
    section?: string,
    type?: SectionType,
    year?: number
}

export const sectionTypeOptions: SectionType[] = [
  "LECTURE",
  "TUTORIAL",
  "LABORATORY",
  "DISCUSSION",
  "SEMINAR",
  "WORKSHOP",
  "EXPERENTIAL",
  "INDEPENDENT_STUDY"
];