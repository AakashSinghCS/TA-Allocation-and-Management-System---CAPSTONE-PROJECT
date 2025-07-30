import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdateExamModal from "../exampage/UpdateExamModal";
import type { ExamDto } from "../../../interfaces/exam/Exam";
import { vi } from "vitest";
import { ToastContainer } from "react-toastify";

describe("UpdateExamModal", () => {
  const mockExam: ExamDto = {
    id: 1,
    courseId: 1,
    sectionId: 1,
    term: "W1",
    date: "2025-07-28",
    startTime: "10:00",
    endTime: "11:00",
  };

  const onUpdate = vi.fn();
  const closeModal = vi.fn();

  beforeEach(() => {
    localStorage.setItem("token", "fake-token");
    render(
      <>
        <UpdateExamModal exam={mockExam} onUpdate={onUpdate} closeModal={closeModal} />
        <ToastContainer />
      </>
    );
  });

  it("renders the modal with pre-filled values", () => {
    expect(screen.getByDisplayValue("2025-07-28")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("11:00")).toBeInTheDocument();
  });

  it("shows error if fields are empty", async () => {
    fireEvent.change(screen.getByLabelText("Start Time"), { target: { value: "" } });
    fireEvent.click(screen.getByText("Update"));
    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    });
  });

  it("shows error if end time is before start time", async () => {
    fireEvent.change(screen.getByLabelText("Start Time"), { target: { value: "11:00" } });
    fireEvent.change(screen.getByLabelText("End Time"), { target: { value: "10:00" } });
    fireEvent.click(screen.getByText("Update"));
    await waitFor(() => {
      expect(screen.getByText("End time must be after start time.")).toBeInTheDocument();
    });
  });

  it("calls update and closes modal on successful update", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: vi.fn() });

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
      expect(closeModal).toHaveBeenCalled();
    });
  });
});
