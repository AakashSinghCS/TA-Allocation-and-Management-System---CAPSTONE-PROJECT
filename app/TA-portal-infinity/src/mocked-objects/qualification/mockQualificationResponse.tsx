import type { QualificationResponse } from "../../api/instructor/fetchAllInstructorQualifications";
import { mockSectionCOSC111 } from "../section/mockSectionCOSC111";
import { mockSectionMATH125 } from "../section/mockSectionMATH125";
import { mockQualificationCOSC111, mockQualificationMATH125 } from "./mockQualifications";

export const mockQualificationResponse: QualificationResponse[] = [
    {
        section: mockSectionCOSC111, qualifications: mockQualificationCOSC111
    },
    {
        section: mockSectionMATH125, qualifications: mockQualificationMATH125
    }
]
