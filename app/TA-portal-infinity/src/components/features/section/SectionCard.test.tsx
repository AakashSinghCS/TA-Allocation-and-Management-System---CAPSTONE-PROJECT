import { mockSectionCOSC111 } from "../../../mocked-objects/mockSectionCOSC111";
import { render, screen, within } from "@testing-library/react";
import SectionCard from "./SectionCard";

describe("SectionCard", () => {
   it("shows section details", () => {
      const section = mockSectionCOSC111;
      render(<SectionCard section={section} />);
      // 1) Compute the full header text exactly as the component does:
      const courseCodeAndName =
         `${section.sectionDetails.deptCode} ${section.sectionDetails.courseNum} ` +
         `${section.sectionDetails.section} - ${section.sectionDetails.name}`;
      const metaInfo = `| ${section.sectionDetails.type} | ${section.sectionDetails.term}`;
      // 2) Find the card by that header:
      const card = screen.getByText(courseCodeAndName).closest("div")!;

      // 3) Assert header is present
      expect(within(card).getByText(courseCodeAndName)).toBeInTheDocument();

      // 4) Assert meta-info (type & term)
      expect(screen.getByText(metaInfo)).toBeInTheDocument();
   });

   it("shows section schedule correctly", () => {
      const section = mockSectionCOSC111;
      render(<SectionCard section={section} />);

      const scheduleContainer = screen.getByText("Section Schedule:").nextSibling as HTMLElement;

      section.sectionSchedule.forEach((sch) => {
         const scheduleText = `${sch.day}-${sch.startTime}-${sch.endTime}`;
         expect(scheduleContainer).toHaveTextContent(scheduleText);
      });
   });
});
