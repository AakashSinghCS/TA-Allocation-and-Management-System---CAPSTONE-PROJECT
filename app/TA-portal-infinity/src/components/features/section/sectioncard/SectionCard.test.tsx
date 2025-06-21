import { mockSectionCOSC111 } from "../../../../mocked-objects/section/mockSectionCOSC111";
import { render, screen, within } from "@testing-library/react";
import SectionCard from "./SectionCard";
import { MemoryRouter } from "react-router-dom";

const fmt = (n: unknown) => (typeof n === "number" ? n : "-");

describe("SectionCard", () => {
  it("shows section details", () => {
    const section = mockSectionCOSC111;
    render(
      <MemoryRouter><SectionCard section={section} /></MemoryRouter>
    );

    const courseCodeAndName =
      `${section.sectionDetails?.deptCode} ${section.sectionDetails?.courseNum} ` +
      `${section.sectionDetails?.section} - ${section.sectionDetails?.name}`;
    const metaInfo = `| ${section.sectionDetails?.type} | ${section.sectionDetails?.term}`;

    const card = screen.getByTestId(`section-card-${section.sectionDetails?.id}`);
    expect(within(card).getByText(courseCodeAndName)).toBeInTheDocument();

  });

  it("shows section schedule and hours badge", () => {
    const section = mockSectionCOSC111;
    render(<MemoryRouter><SectionCard section={section} /></MemoryRouter>);

    section.sectionSchedule?.forEach(({ day, startTime, endTime }) => {
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
