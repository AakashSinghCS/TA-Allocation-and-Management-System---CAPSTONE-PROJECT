import type { Allocation } from "../allocation/Allocation";
import type { Need } from "../need/Need";
import type { Instructor } from "../user/Instructor";
import type { SectionDetails, SectionType } from "./SectionDetails";
import type SectionSchedule from "./SectionSchedule";

export default interface Section {
    sectionDetails?: SectionDetails;
    sectionSchedule?: SectionSchedule[];
    need?: Need; //don't need to call the need every single time we use this interface.
    hasCompleted?: boolean;
    allocations?: Allocation[];
    instructor?: Instructor;
}

export interface SectionProfile{
    semester?: string,
    section?: string,
    type?: SectionType,
    year? : number
}

export const sectionProfileFields: (keyof SectionProfile)[] = [
    "section",
    "year",
    "semester",
    "type"
];

export const sectionFieldLabels: Record<keyof SectionProfile, string> = {
    section: "Section Code",
    year: "Year",
    semester: "Semester",
    type: "Type",
};