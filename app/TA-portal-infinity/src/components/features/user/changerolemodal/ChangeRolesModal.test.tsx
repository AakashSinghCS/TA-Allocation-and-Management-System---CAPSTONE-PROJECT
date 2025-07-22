import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect, beforeEach } from "vitest";
import ChangeRolesModal from "./ChangeRolesModal";
import type { UserRole } from "../../../../interfaces/enum/UserRole";

describe("ChangeRolesModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const currentRoles: UserRole[] = ["STUDENT", "COORDINATOR"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderModal() {
    render(
      <ChangeRolesModal
        currentRoles={currentRoles}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
  }

  it("renders the modal with current roles checked", () => {
    renderModal();
    expect(screen.getByText("Change Roles")).toBeInTheDocument();

    const studentCheckbox = screen.getByLabelText("STUDENT") as HTMLInputElement;
    const coordinatorCheckbox = screen.getByLabelText("COORDINATOR") as HTMLInputElement;
    const instructorCheckbox = screen.getByLabelText("INSTRUCTOR") as HTMLInputElement;

    expect(studentCheckbox.checked).toBe(true);
    expect(coordinatorCheckbox.checked).toBe(true);
    expect(instructorCheckbox.checked).toBe(false);
  });

  it("calls onSave with updated roles", () => {
    renderModal();
    const instructorCheckbox = screen.getByLabelText("INSTRUCTOR");
    fireEvent.click(instructorCheckbox); // select INSTRUCTOR

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(["STUDENT", "COORDINATOR", "INSTRUCTOR"]);
  });

  it("calls onClose when Cancel is clicked", () => {
    renderModal();
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when X button is clicked", () => {
    renderModal();
    const xButton = screen.getByText("×");
    fireEvent.click(xButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
