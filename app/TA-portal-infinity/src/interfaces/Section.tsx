import type {SectionDetails}  from "./SectionDetails";
import type SectionSchedule from "./SectionSchedule";

export default interface Section {
    sectionDetails : SectionDetails;
    sectionSchedule : SectionSchedule[];
}