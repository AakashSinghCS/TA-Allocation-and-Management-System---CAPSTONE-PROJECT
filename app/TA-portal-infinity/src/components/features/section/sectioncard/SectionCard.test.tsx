import { mockSectionCOSC111 } from "../../../../mocked-objects/section/mockSectionCOSC111";
import { render, screen, within } from "@testing-library/react";
import SectionCard from "./SectionCard";
import { MemoryRouter } from "react-router-dom";

const fmt = (n: unknown) => (typeof n === "number" ? n : "-");

describe("SectionCard", () => {
  it("shows section title and meta-info", () => {
    const section = mockSectionCOSC111;
    render(
      <MemoryRouter>
        <SectionCard section={section} />
      </MemoryRouter>
    );

    // note the en-dash (U+2013) used in the component
    const dash = "–";

    const titleLine =
      `${section.course!.deptCode} ` +
      `${section.course!.courseNum} ` +
      `${section!.section} ` +
      `${dash} ` +
      `${section.course!.name}`;

    const metaLine = `${section!.type} | ${section?.year} | ${section!.semester}`;

    const card = screen.getByTestId(
      `section-card-${section.course!.id}`
    );

    // assert that both title and meta-info appear inside the card
    expect(within(card).getByText(titleLine)).toBeInTheDocument();
    expect(within(card).getByText(metaLine)).toBeInTheDocument();
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
