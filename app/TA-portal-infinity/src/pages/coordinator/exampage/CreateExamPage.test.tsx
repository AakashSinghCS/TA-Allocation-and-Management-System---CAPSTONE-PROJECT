import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateExamPage from "../../../pages/coordinator/exampage/CreateExamPage";
import { AuthProvider } from "../../../context/AuthContext";
import { BrowserRouter } from "react-router-dom";

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
    expect(screen.getByPlaceholderText("e.g. John")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 12345678")).toBeInTheDocument();
    expect(screen.getByText("Assign")).toBeInTheDocument();
  });

  it("shows alert on empty exam form submit", async () => {
    window.alert = vi.fn();
    fireEvent.click(screen.getByRole("button", { name: "Create Exam" }));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Please fill in all fields.");
    });
  });

  it("shows alert on empty assign form submit", async () => {
    window.alert = vi.fn();
    fireEvent.click(screen.getByText("Assign"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Please fill in all fields.");
    });
  });

  it("updates student name and number inputs", () => {
    const nameInput = screen.getByPlaceholderText("e.g. John");
    const numInput = screen.getByPlaceholderText("e.g. 12345678");

    fireEvent.change(nameInput, { target: { value: "Alice" } });
    fireEvent.change(numInput, { target: { value: "12345678" } });

    expect(nameInput).toHaveValue("Alice");
    expect(numInput).toHaveValue("12345678");
  });
});
