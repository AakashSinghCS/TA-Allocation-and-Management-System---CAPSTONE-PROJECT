import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CourseProfileDetails from "./CourseProfileDetails";
import { courseProfileFields } from "../../../../interfaces/course/Course";
import { courseFieldLabels } from "../../../../interfaces/course/Course";

// 1. Mock auth so userRoles includes COORDINATOR
vi.mock("../../../../context/AuthContext", () => ({
  useAuth: () => ({ userRoles: ["COORDINATOR"] as const }),
}));

// 2. Mock toast functions
vi.mock("../../../../utility/confirmation/toastConfirmation", () => ({
  showToastConfirmation: vi.fn().mockResolvedValue(true),
  showToastSuccess: vi.fn(),
  showToastError: vi.fn(),
}));

// 3. Mock API functions
const mockFetchCourse = vi.fn();
const mockFetchUpdate = vi.fn();
const mockFetchDelete = vi.fn();
vi.mock("../../../../api/course/fetchCourse", () => ({
  fetchCourse: () => mockFetchCourse(),
}));
vi.mock("../../../../api/course/fetchUpdateCourse", () => ({
  fetchUpdateCourse: () => mockFetchUpdate(),
}));
vi.mock("../../../../api/course/fetchDeleteCourse", () => ({
  fetchDeleteCourse: (...args: Parameters<typeof mockFetchDelete>) =>
    mockFetchDelete(...args),
}));

// 4. Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("CourseProfileDetails", () => {
  const course = { id: 42, deptCode: "ENG", courseNum: "101", name: "Intro" };
  beforeEach(() => {
    vi.clearAllMocks();
    // If your delete returns true:
    mockFetchDelete.mockResolvedValue(true);
    vi.spyOn(window, "confirm").mockReturnValue(true)
    vi.spyOn(window, "prompt").mockReturnValue("DELETE")
  });

  it("toggles to edit mode when Edit Details is clicked", async () => {
    render(
      <CourseProfileDetails course={course} fields={courseProfileFields} labels={courseFieldLabels} />
    );

    // Edit button should appear for a coordinator
    const editBtn = screen.getByRole("button", { name: /edit details/i });
    fireEvent.click(editBtn);

    // Now you should see the EditCourseDetails component (it renders form fields)
    expect(
      await screen.findByRole("button", { name: /save/i })
    ).toBeInTheDocument();
  });

  it("calls delete API and navigates back when Delete is clicked", async () => {
    render(
      <CourseProfileDetails course={course} fields={courseProfileFields} labels={courseFieldLabels} />
    );

    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockFetchDelete).toHaveBeenCalledWith(42);
    });
    // navigate(-1) should have been called
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
