import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UpdateAssignmentModal from "./UpdateAssignmentModal";
import type ExamAssignmentDto from "../../../interfaces/exam/ExamAssignment";
import { toast } from "react-toastify";

vi.mock("react-toastify", async () => {
  const actual = await vi.importActual<typeof import("react-toastify")>("react-toastify");
  return {
    ...actual,
    toast: {
      error: vi.fn(),
    },
  };
});

describe("UpdateAssignmentModal", () => {
  const mockAssignment: ExamAssignmentDto = {
    id: 1,
    studentId: 101,
    examId: 202,
    task: "MARKING",
    date: "2025-07-28",
    startTime: "10:00",
    endTime: "12:00",
  };

  const onUpdate = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal with initial values", () => {
    render(
      <UpdateAssignmentModal
        isOpen={true}
        assignment={mockAssignment}
        onUpdate={onUpdate}
        onClose={onClose}
      />
    );

    expect(screen.getByText("Update Assignment")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("MARKING");
    expect(screen.getByDisplayValue("2025-07-28")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12:00")).toBeInTheDocument();
  });


  it("shows error if end time is before start time", () => {
    const toastErrorSpy = vi.spyOn(toast, "error");

    render(
      <UpdateAssignmentModal
        isOpen={true}
        assignment={mockAssignment}
        onUpdate={onUpdate}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByLabelText("Task"), { target: { value: "MARKING" } });
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2025-07-28" } });
    fireEvent.change(screen.getByLabelText("Start Time"), { target: { value: "14:00" } });
    fireEvent.change(screen.getByLabelText("End Time"), { target: { value: "10:00" } });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(toastErrorSpy).toHaveBeenCalledWith("End time must be after start time.");
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
