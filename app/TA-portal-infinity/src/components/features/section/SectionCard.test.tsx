import { mockSectionCOSC111 } from "../../../mocked-objects/mockSectionCOSC111";
import { render, screen, within } from "@testing-library/react";
import SectionCard from "./SectionCard";

describe("SectionCard", () => {
     it("shows section details", () => {
        const section =  mockSectionCOSC111;
         render(<SectionCard section = {section}/>);
        
        
        const fullTermCourseNameRegex = new RegExp(`^${section.sectionDetails.deptCode}\\s+${section.sectionDetails.courseNum}\\s+${section.sectionDetails.section}$`, "i");
        
        const courseRow = screen.getByText(fullTermCourseNameRegex).closest('div')!;
        expect(within(courseRow).getByText(new RegExp(`^${section.sectionDetails.name}$`))).toBeInTheDocument();
        expect(within(courseRow).getByText(new RegExp(fullTermCourseNameRegex))).toBeInTheDocument();
        expect(within(courseRow).getByText(new RegExp(`^${section.sectionDetails.term}$`))).toBeInTheDocument();
     });
});