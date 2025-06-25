import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserBrowsingViewer from "./UserBrowsingViewer";
import { mockStudentJohnDoe, mockStudentEmmaDoe } from "../../../mocked-objects/user/mockStudents";
import { vi } from "vitest";

vi.mock("../../../components/ui/searchuserbar/SearchUserBar", () => ({
  useUserSearch: () => ({
    searchedUsers: [mockStudentJohnDoe, mockStudentEmmaDoe],
    loading: false,
    error: null,
    search: vi.fn(),
    deleteUser: deleteUserMock,
    lastCriteria: { role: "Student", name: "", universityNumber: "" },
  }),
  default: () => <div data-testid="search-bar" />,
}));

const deleteUserMock = vi.fn();

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ userRoles: ["STUDENT"] }),
}));

describe("UserBrowsingViewer", () => {
  beforeEach(() => {
    deleteUserMock.mockClear();
  });

  it("renders two students and calls deleteUser on click", () => {
    render(
      <MemoryRouter>
        <UserBrowsingViewer />
      </MemoryRouter>
    );

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/emma doe/i)).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(deleteUserMock).toHaveBeenCalledWith(mockStudentJohnDoe.id);
  });
});
