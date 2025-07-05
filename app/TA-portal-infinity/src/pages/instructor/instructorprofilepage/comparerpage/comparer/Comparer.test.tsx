import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Comparer from "./Comparer";
import { mockStudentJohnDoe, mockStudentEmmaDoe } from "../../../../mocked-objects/user/mockStudents";
import { mockSectionCOSC121 } from "../../../../mocked-objects/section/mockSectionCOSC121";


vi.mock("../../../../components/ui/searchuserbar/SearchUserBar", () => ({
  useUserSearch: (): any => ({
    searchedUsers: [mockStudentJohnDoe, mockStudentEmmaDoe],
    loading: false,
    error: null,
    search: vi.fn(),
    deleteUser: vi.fn(),
    lastCriteria: { role: "Student", name: "", universityNumber: "" },
  }),
  default: () => null,
}));

describe("Comparer component", () => {
  it("renders seeded students and enables compare on select", () => {
    render(
      <MemoryRouter>
        <Comparer sections={[mockSectionCOSC121]} />
      </MemoryRouter>
    );

    // Both students should be visible
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/emma doe/i)).toBeInTheDocument();

    const compareBtn = screen.getByRole("button", { name: /compare needs/i });
    expect(compareBtn).toBeDisabled();

    // Select Emma
    fireEvent.click(screen.getByText(/emma doe/i));
    expect(compareBtn).toBeEnabled();
  });
});
