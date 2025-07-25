import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type Section from "../../../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../../../mocked-objects/section/mockSectionCOSC111";
import SectionsColumn from "./SectionsColumn";

describe("SectionsColumn", () => {
  const mockSections: Section[] = [mockSectionCOSC111];

  it("renders a SectionCard for each section and displays their details", () => {
    render(
      <MemoryRouter>
        <SectionsColumn sections={mockSections} />
      </MemoryRouter>
    );

    const  sectionDetails  = mockSections[0];
    const id = sectionDetails!.id;
    const dept = sectionDetails!.course?.deptCode;
    const num = sectionDetails!.course?.courseNum;
    const sec = sectionDetails!.section;
    const name = sectionDetails!.course?.name;

    // Use the testid from SectionCard's Link:
    const link = screen.getByTestId(`section-link-${id}`);
    // Check that the course components appear in the link text (course name is separate)
    expect(link).toHaveTextContent(dept!);
    expect(link).toHaveTextContent(num!);
    expect(link).toHaveTextContent(sec!);
    // Course name appears elsewhere in the card, not in the link
    expect(screen.getByText(name!)).toBeInTheDocument();

    // And since there's at least one section, we should *not* see the empty placeholder:
    expect(
      screen.queryByText("No courses to display", { exact: true })
    ).toBeNull();
  });

  it("shows a placeholder when there are no sections", () => {
    render(
      <MemoryRouter>
        <SectionsColumn sections={[]} />
      </MemoryRouter>
    );

    expect(
      screen.getByText("No courses to display", { exact: true })
    ).toBeInTheDocument();
  });

  // it("applies the passed className to the outer <section>", () => {
  //   const { container } = render(
  //     <MemoryRouter>
  //       <SectionsColumn
  //         sections={mockSections}
  //         className="my-special-class"
  //       />
  //     </MemoryRouter>
  //   );
  //   const sect = container.querySelector("section");
  //   expect(sect).toHaveClass("my-special-class");
  // });
});
