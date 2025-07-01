import { render, screen } from "@testing-library/react";
import SectionsColumn from "./SectionsColumn";
import type Section from "../../../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../../../mocked-objects/section/mockSectionCOSC111";
import { MemoryRouter } from "react-router-dom";


describe("SectionsColumn", () => {
  const mockSections: Section[] = [
   mockSectionCOSC111
  ];

  it("renders a SectionCard for each section and displays their details", () => {
    render(<MemoryRouter><SectionsColumn sections={mockSections} /></MemoryRouter>);
          const fullHeadingText = 
  `${mockSections[0].sectionDetails?.deptCode} ` +
  `${mockSections[0].sectionDetails?.courseNum} ` +
  `${mockSections[0].sectionDetails?.section}` +
  ` - ${mockSections[0].sectionDetails?.name}`;
    const link = screen.getAllByRole("link");
    // expect(link).toHaveLength(mockSections.length);
    expect(screen.getByText(fullHeadingText)).toBeInTheDocument();
    
    expect(screen.queryByText("No courses to display")).toBeNull();
  });

  it("shows a placeholder when there are no sections", () => {
    render(<MemoryRouter><SectionsColumn sections={[]} /></MemoryRouter>);

    expect(screen.getByText("No courses to display", { exact: true })).toBeInTheDocument();
  });

  it("applies the passed className to the outer <section>", () => {
    const { container } = render(
      <MemoryRouter><SectionsColumn sections={mockSections} className="my-special-class" /></MemoryRouter>
    );
    const sect = container.querySelector("section");
    expect(sect).toHaveClass("my-special-class");
  });
});
