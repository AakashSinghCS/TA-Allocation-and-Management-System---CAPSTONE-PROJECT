import { mockSectionCOSC111 } from "../../../../mocked-objects/mockSectionCOSC111";
import { render, screen, within } from "@testing-library/react";
import SectionCard from "./SectionCard";

const fmt = (n: unknown) => (typeof n === "number" ? n : "-");

describe("SectionCard", () => {
  it("shows section details", () => {
    const section = mockSectionCOSC111;
    render(<SectionCard section={section} />);

    const courseCodeAndName =
      `${section.sectionDetails.deptCode} ${section.sectionDetails.courseNum} ` +
      `${section.sectionDetails.section} - ${section.sectionDetails.name}`;
    const metaInfo = `| ${section.sectionDetails.type} | ${section.sectionDetails.term}`;

    const card = screen.getByText(courseCodeAndName).closest("div")!;
    expect(within(card).getByText(courseCodeAndName)).toBeInTheDocument();
    expect(screen.getByText(metaInfo)).toBeInTheDocument();
  });

  it("shows section schedule and hours badge", () => {
    const section = mockSectionCOSC111;
    render(<SectionCard section={section} />);

    section.sectionSchedule.forEach(({ day, startTime, endTime }) => {
      const time = `${day}-${startTime}-${endTime}`;
      expect(
        screen.getByText((_, node) => node?.textContent?.trim() === time)
      ).toBeInTheDocument();
    });

    const alloc = section.need?.numOfHoursCurrentlyAllocated;
    const req   = section.need?.requiredGradingHours; 
    const badge = `(${fmt(alloc)}/${fmt(req)}) hrs alloc.`;
    expect(screen.getByText(badge)).toBeInTheDocument();
  });
});
