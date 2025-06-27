import type {SectionDetails}  from "./SectionDetails"
import type SectionSchedule from "./SectionSchedule";
import type { Need } from "../need/Need";
import type { Allocation } from "../allocation/Allocation";
import type { Instructor } from "../user/Instructor";

export default interface Section {
    sectionDetails? : SectionDetails;
    sectionSchedule? : SectionSchedule[];
    need? : Need; //don't need to call the need every single time we use this interface.
    hasCompleted? : boolean;
    allocations?: Allocation[];
    instructor?: Instructor;
}