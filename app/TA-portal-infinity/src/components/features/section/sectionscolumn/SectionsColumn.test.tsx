import { render, screen } from "@testing-library/react";
import SectionsColumn from "./SectionsColumn";
import type Section from "../../../../interfaces/section/Section";
import { mockSectionCOSC111 } from "../../../../mocked-objects/mockSectionCOSC111";


describe("SectionsColumn", () => {
  const mockSections: Section[] = [
   mockSectionCOSC111
  ];

  it("renders a SectionCard for each section and displays their details", () => {
    render(<SectionsColumn sections={mockSections} />);
    const fullHeadingText = 
  `${mockSections[0].sectionDetails.deptCode} ` +
  `${mockSections[0].sectionDetails.courseNum} ` +
  `${mockSections[0].sectionDetails.section}` +
  ` - ${mockSections[0].sectionDetails.name}`;
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(mockSections.length);
    expect(screen.getByText(fullHeadingText)).toBeInTheDocument();
    expect( screen.getByText(new RegExp(mockSections[0].sectionDetails.term))).toBeInTheDocument();
    
    expect(screen.queryByText("No courses to display")).toBeNull();
  });

  it("shows a placeholder when there are no sections", () => {
    render(<SectionsColumn sections={[]} />);

    expect(screen.getByText("No courses to display", { exact: true })).toBeInTheDocument();
  });

  it("applies the passed className to the outer <section>", () => {
    const { container } = render(
      <SectionsColumn sections={mockSections} className="my-special-class" />
    );
    const sect = container.querySelector("section");
    expect(sect).toHaveClass("my-special-class");
  });
});
