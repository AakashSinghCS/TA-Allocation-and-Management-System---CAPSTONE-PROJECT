// From: app/TA-portal-infinity/src/interfaces/section/SectionDetails.tsx
export type SectionType =
    | "Lecture"
    | "Tutorial"
    | "Laboratory"
    | "Discussion"
    | "Seminar"
    | "Workshop"
    | "Experential"
    | "Independent Study";

export interface SectionDetails {
    id: number;
    name: string;
    deptCode: string;
    courseNum: string;
    term: string;
    section: string;
    type: SectionType;
}


// From: app/TA-portal-infinity/src/interfaces/section/Section.tsx
export default interface Section {
    sectionDetails: SectionDetails;
    // As requested, we will ignore this for now by setting it to an empty array.
    sectionSchedule: [];
}