import { fetchSectionDetails } from "./fetchSectionDetails";
import { fetchAllSectionSchedules } from "./fetchAllSectionSchedules";
import type Section from "../../interfaces/section/Section";

export async function fetchSection(sectionId: number): Promise<Section> {

    const [sectionDetails, sectionSchedules] = await Promise.all([
        fetchSectionDetails(sectionId),
        fetchAllSectionSchedules(sectionId)
    ]);

    const section  :Section= {
        sectionDetails : sectionDetails,
        sectionSchedule: sectionSchedules
    }

    return section;
}