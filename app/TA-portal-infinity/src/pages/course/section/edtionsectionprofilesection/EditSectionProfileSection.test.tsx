// src/components/section/edtionsectionprofilesection/EditSectionProfileSection.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SectionProfile } from "../../../../interfaces/section/Section";
import { sectionFieldLabels, sectionProfileFields } from "../../../../interfaces/section/Section";
import EditSectionProfileSection, {
  SECTION_TYPE_OPTIONS,
} from "./EditSectionProfileSection";

// 1. Mock the UserBrowsingViewer to render a simple “SelectInstructor” button
vi.mock(
  "../../../coordinator/userbrowsingpage/userbrowsingviewer/UserBrowsingViewer",
  () => ({
    default: (props: any) => (
      <button
        onClick={() =>
          props.onSelect({ id: 9, firstName: "Jane", lastName: "Doe" })
        }
      >
        SelectInstructor
      </button>
    ),
  })
);

describe("EditSectionProfileSection", () => {
  const sectionId = 123;
  const baseSection: SectionProfile = {
    sectionId: sectionId,
    semester: "W1",
    type: SECTION_TYPE_OPTIONS[0],
    name: "Intro to X",
    year: 2025,
    deptCode: "ENG",
    courseNum: "101",
    // add any other fields your interface requires...
  } as any;

  const fields = (["semester", "type", "name"] as const);
  const labels: Record<typeof fields[number], string> = {
    semester: "Semester",
    type: "Type",
    name: "Name",
  };

  let onSave: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onSave = vi.fn().mockResolvedValue(undefined);
    onCancel = vi.fn();
  });

  it("renders inputs/selects for each field and submits correct payload", async () => {
    render(
      <EditSectionProfileSection
        sectionId={sectionId}
        section={baseSection}
        fields={sectionProfileFields}
        labels={sectionFieldLabels}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // name input
    const yearInput = screen.getByLabelText("Year") as HTMLInputElement;
    expect(yearInput.value).toBe("2025");
    fireEvent.change(yearInput, { target: { value: 2024 } });

    // semester select
    const semesterSelect = screen.getByLabelText("Semester") as HTMLSelectElement;
    expect(semesterSelect.value).toBe("W1");
    fireEvent.change(semesterSelect, { target: { value: "S2" } });

    // type select
    const typeSelect = screen.getByLabelText("Type") as HTMLSelectElement;
    expect(typeSelect.value).toBe(SECTION_TYPE_OPTIONS[0]);
    const newType = SECTION_TYPE_OPTIONS[1] ?? "";
    fireEvent.change(typeSelect, { target: { value: newType } });

    // select an instructor
    fireEvent.click(screen.getByText("SelectInstructor"));
    // verify instructor shown
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    // submit form
    fireEvent.click(screen.getByRole("button", { name: /^Save$/i }));

    // onSave should be called with updated payload
    expect(onSave).toHaveBeenCalledWith({
      semester: "S2",
      type: newType,
      year:"2024",
      instructorId: 9,
      section: undefined
    });
  });

  it("calls onCancel when Cancel is clicked", () => {
    render(
      <EditSectionProfileSection
        sectionId={sectionId}
        section={baseSection}
        fields={sectionProfileFields}
        labels={sectionFieldLabels}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
