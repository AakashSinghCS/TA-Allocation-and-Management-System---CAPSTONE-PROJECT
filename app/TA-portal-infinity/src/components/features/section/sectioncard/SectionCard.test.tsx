import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { mockSectionCOSC111 } from "../../../../mocked-objects/section/mockSectionCOSC111";
import SectionCard from "./SectionCard";

describe("SectionCard", () => {
  it("shows section title and meta-info", () => {
    const section = mockSectionCOSC111;
    render(
      <MemoryRouter>
        <SectionCard section={section} />
      </MemoryRouter>
    );

    const card = screen.getByTestId(
      `section-card-${section!.id}`
    );

    // Check that the course code and number appear in the card (text broken up by elements)
    expect(within(card).getByText((_, node) => {
      const hasText = node?.textContent?.replace(/\s+/g, '') === 'COSC111001';
      return Boolean(hasText);
    })).toBeInTheDocument();
    
    // Check meta info components separately as they're in different spans
    expect(within(card).getByText('LECTURE')).toBeInTheDocument();
    expect(within(card).getByText('2024')).toBeInTheDocument();
    expect(within(card).getByText('W1')).toBeInTheDocument();
  });

  // it("shows section schedule and hours badge", () => {
  //   const section = mockSectionCOSC111;
  //   render(
  //     <MemoryRouter>
  //       <SectionCard section={section} />
  //     </MemoryRouter>
  //   );

  //   // each scheduled span should render "Day-StartTime-EndTime"
  //   section.sectionSchedule!.forEach(({ day, startTime, endTime }) => {
  //     const time = `${day}-${startTime}-${endTime}`;
  //     expect(
  //       screen.getByText((_, node) => node?.textContent?.trim() === time)
  //     ).toBeInTheDocument();
  //   });

  //   // hours badge: "(alloc/req) hrs alloc."
  //   const alloc = section.need?.numHoursCurrentlyAllocated;
  //   const req = section.need?.requiredGradingHours;
  //   const badge = `(${fmt(alloc)}/${fmt(req)}) hrs alloc.`;
  //   expect(screen.getByText(badge)).toBeInTheDocument();
  // });
});
