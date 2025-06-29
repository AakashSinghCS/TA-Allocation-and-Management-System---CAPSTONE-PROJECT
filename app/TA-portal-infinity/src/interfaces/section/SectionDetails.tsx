import type { Course } from "../course/Course"

export type SectionType =
    | "Lecture"
    | "Tutorial"
    | "Laboratory"
    | "Discussion"
    | "Seminar"
    | "Workshop"
    | "Experential"
    | "Independent Study"

export interface SectionDetails extends Course{
    sectionId?: number,
    semester?: string,
    section?: string,
    type?: SectionType,
    year? : number
}