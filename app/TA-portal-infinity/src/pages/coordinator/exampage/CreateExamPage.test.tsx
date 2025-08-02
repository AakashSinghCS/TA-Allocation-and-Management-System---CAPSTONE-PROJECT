import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateExamPage from "../../../pages/coordinator/exampage/CreateExamPage";
import { AuthProvider } from "../../../context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";

vi.mock("react-toastify", async () => {
  const actual = await vi.importActual<typeof import("react-toastify")>("react-toastify");

  return {
    ...actual,
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    ToastContainer: (props: any) => <div data-testid="toast-container" {...props} />,
  };
});


describe("CreateExamPage", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CreateExamPage />
        </AuthProvider>
      </BrowserRouter>
    );
  });

  it("renders Create Exam form", () => {
    expect(screen.getByRole("heading", { name: "Create Exam" })).toBeInTheDocument();
    expect(screen.getByText("Department Code")).toBeInTheDocument();
    expect(screen.getByText("Course Number")).toBeInTheDocument();
    expect(screen.getByText("Start Time (HH:MM)")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create Exam" })).toBeInTheDocument();
  });

  it("renders Assign Student to Exam form", () => {
    expect(screen.getByText("Assign Student to Exam")).toBeInTheDocument();
    expect(screen.getByText("Assign")).toBeInTheDocument();
  });

  it("shows alert on empty exam form submit", async () => {
    fireEvent.click(screen.getByRole("button", { name: "Create Exam" }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please fill in all fields.");
    });
  });

  it("shows alert on empty assign form submit", async () => {
    fireEvent.click(screen.getByText("Assign"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please fill in all fields.");
    });
  });

  
});
