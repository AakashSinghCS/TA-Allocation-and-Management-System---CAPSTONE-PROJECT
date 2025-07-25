import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import UserBrowsingViewer from "./UserBrowsingViewer";
import { mockStudentJohnDoe, mockStudentEmmaDoe } from "../../../../mocked-objects/user/mockStudents";

const useAuthMock = vi.fn();
vi.mock("../../../../context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

const refetchMock = vi.fn();
vi.mock("../../../../api/user/search/useUserSearch", () => ({
  useUserSearchPage: () =>
    ({
      data: {
        content: [
          { ...mockStudentJohnDoe, active: true },
          { ...mockStudentEmmaDoe, active: false },
        ],
        totalPages: 1,
      },
      isFetching: false,
      isError: false,
      error: null,
      refetch: refetchMock,
    } as const),
}));

vi.mock("../../../../components/ui/user/searchuserbar/SearchUserBar", () => ({
  default: () => <div data-testid="search-bar" />,
}));
vi.mock("../../../../api/admin/fetchActivation", () => ({
  fetchActivate: vi.fn(async (id: number) => true),
  fetchDeactivate: vi.fn(async (id: number) => true),
}));

// 2. Now import them—these will be the very spies you just created above
import { fetchActivate, fetchDeactivate } from "../../../../api/admin/fetchActivation";
describe("UserBrowsingViewer (updated)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // By default confirm returns true
    vi.stubGlobal("confirm", () => true);
  });

  it("shows Deactivate/Activate buttons for ADMIN and calls the right API", async () => {
    // Admin context
    useAuthMock.mockReturnValue({ userRoles: ["ADMIN"] });

    render(
      <MemoryRouter>
        <UserBrowsingViewer allowedRoles={['Student']} />
      </MemoryRouter>
    );

    // We should see two buttons, one for each student
    const buttons = screen.getAllByRole("button", { name: /activate|deactivate/i });
    expect(buttons).toHaveLength(2);

    // First student is active → "Deactivate"
    expect(buttons[0]).toHaveTextContent("Deactivate");
    // Second student is inactive → "Activate"
    expect(buttons[1]).toHaveTextContent("Activate");

    // Click Deactivate
    fireEvent.click(buttons[0]);
    expect(fetchDeactivate).toHaveBeenCalledWith(mockStudentJohnDoe.id);

    // Click Activate
    fireEvent.click(buttons[1]);
    expect(fetchActivate).toHaveBeenCalledWith(mockStudentEmmaDoe.id);

    // refetch should also get called twice
    // expect(refetchMock).toHaveBeenCalledTimes(2);
  });

  it("disables activation buttons for non-ADMIN roles", () => {
    useAuthMock.mockReturnValue({ userRoles: ["STUDENT"] });

    render(
      <MemoryRouter>
        <UserBrowsingViewer allowedRoles={['Student']} />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole("button", { name: /activate|deactivate/i });
    expect(buttons).toHaveLength(2);

    // Both should be disabled
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("does not call API if user cancels the confirmation dialog", () => {
    useAuthMock.mockReturnValue({ userRoles: ["ADMIN"] });
    // User clicks "Cancel" on confirm
    vi.stubGlobal("confirm", () => false);

    render(
      <MemoryRouter>
        <UserBrowsingViewer allowedRoles={['Student']} />
      </MemoryRouter>
    );

    const [deactivateBtn] = screen.getAllByRole("button", { name: /deactivate/i });
    fireEvent.click(deactivateBtn);

    expect(fetchDeactivate).not.toHaveBeenCalled();
    expect(refetchMock).not.toHaveBeenCalled();
  });
});
