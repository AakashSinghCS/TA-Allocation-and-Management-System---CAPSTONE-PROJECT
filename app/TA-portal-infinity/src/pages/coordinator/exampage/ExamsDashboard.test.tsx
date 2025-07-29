
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ExamsDashboard from "./ExamsDashboard";
import { AuthContext } from "../../../context/AuthContext";

vi.mock("../exampage/AssignedStudentsList", () => ({
  default: () => <div>Mocked AssignedStudentsList</div>,
}));

vi.mock("../exampage/UpdateExamModal", () => ({
  default: ({ closeModal }: { closeModal: () => void }) => (
    <div>
      Mocked UpdateExamModal
      <button onClick={closeModal}>Close</button>
    </div>
  ),
}));

const mockToken = "test-token";

const mockExams = [
  {
    id: 1,
    courseId: 2,
    sectionId: 3,
    term: "W1",
    date: "2025-08-01",
    startTime: "10:00",
    endTime: "12:00",
  },
];

const mockSection = {
  id: 3,
  year: 2025,
  semester: "W1",
  section: "001",
  type: "TUTORIAL",
  course: {
    id: 2,
  },
};

const mockCourse = {
  id: 2,
  deptCode: "COSC",
  courseNum: "499",
  name: "Capstone",
};

describe("ExamsDashboard", () => {
  beforeEach(() => {
    global.fetch = vi.fn()
      
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockExams,
      })
      
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSection,
      })
      
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCourse,
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  

  it("calls delete API and removes exam from UI", async () => {
    
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockExams }) // exams
      .mockResolvedValueOnce({ ok: true, json: async () => mockSection }) // section
      .mockResolvedValueOnce({ ok: true, json: async () => mockCourse }) // course
      .mockResolvedValueOnce({ ok: true }); // delete call

    render(
      <AuthContext.Provider
        value={{
            token: mockToken,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
            userRoles: [],
            userId: 1,
        }}
      >
        <ExamsDashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("COSC 499 001 W1 2025")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText("COSC 499 001 W1 2025")).not.toBeInTheDocument();
    });
  });

  it("displays error if fetch fails", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Fetch failed"));

    render(
      <AuthContext.Provider
        value={{
            token: mockToken,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
            userRoles: [],
            userId: 1,
        }}
      >
        <ExamsDashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("No exams available.")).toBeInTheDocument();
    });
  });
});
