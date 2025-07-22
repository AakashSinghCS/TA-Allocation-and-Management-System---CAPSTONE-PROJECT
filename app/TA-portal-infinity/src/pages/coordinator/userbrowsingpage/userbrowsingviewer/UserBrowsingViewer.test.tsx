import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserBrowsingViewer from "./UserBrowsingViewer";
import { mockStudentJohnDoe, mockStudentEmmaDoe } from "../../../../mocked-objects/user/mockStudents";
import { vi } from "vitest";

const toggleActivationMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("../../../../components/ui/user/searchuserbar/SearchUserBar", () => ({
  useUserSearch: () => ({
    searchedUsers: [
      { ...mockStudentJohnDoe, active: true },
      { ...mockStudentEmmaDoe, active: false },
    ],
    loading: false,
    error: null,
    search: vi.fn(),
    toggleActivation: toggleActivationMock,
    lastCriteria: { role: "Student", name: "", universityNumber: "" },
  }),
  default: () => <div data-testid="search-bar" />,
}));

vi.mock("../../../../context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("UserBrowsingViewer", () => {
  beforeEach(() => {
    toggleActivationMock.mockClear();
  });

  it("renders students with correct activation buttons and triggers toggle", () => {
    useAuthMock.mockReturnValue({ userRoles: ["ADMIN"] });

    render(
      <MemoryRouter>
        <UserBrowsingViewer />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole("button", { name: /activate|deactivate/i });
    expect(buttons[0]).toHaveTextContent("Deactivate");
    expect(buttons[1]).toHaveTextContent("Activate");

    fireEvent.click(buttons[0]);
    expect(toggleActivationMock).toHaveBeenCalledWith(mockStudentJohnDoe.id, true);
  });

  it("disables toggle buttons for non-admin users", () => {
    useAuthMock.mockReturnValue({ userRoles: ["STUDENT"] });

    render(
      <MemoryRouter>
        <UserBrowsingViewer />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole("button", { name: /activate|deactivate/i });
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
