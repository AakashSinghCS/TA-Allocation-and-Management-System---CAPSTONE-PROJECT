import type {SectionDetails}  from "./SectionDetails"
import type SectionSchedule from "./SectionSchedule";
import type { Need } from "../need/Need";

export default interface Section {
    sectionDetails : SectionDetails;
    sectionSchedule : SectionSchedule[];
    need? : Need; //don't need to call the need every single time we use this interface.
    hasCompleted? : boolean;
}