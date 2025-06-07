export type SectionType =
    | "Lecture"
    | "Tutorial"
    | "Laboratory"
    | "Discussion"
    | "Seminar"
    | "Workshop"
    | "Experential"
    | "Independent Study"

export interface SectionDetails {
    sectionId: number,
    name: string,
    deptCode: string,
    courseNum: string
    term: string,
    section: string,
    type: SectionType,
}