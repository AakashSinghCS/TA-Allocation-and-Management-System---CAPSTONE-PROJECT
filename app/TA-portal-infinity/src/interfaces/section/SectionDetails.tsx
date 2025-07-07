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

export default interface SectionDetails {
    id?: number,
    semester?: string,
    section?: string,
    type?: SectionType,
    year?: number,
    course? : Course,
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