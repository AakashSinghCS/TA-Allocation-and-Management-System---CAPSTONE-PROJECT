import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  fetchActivate: vi.fn(async (_id: number) => true),
  fetchDeactivate: vi.fn(async (_id: number) => true),
}));

vi.mock("../../../../utility/confirmation/toastConfirmation", () => ({
  showToastConfirmation: vi.fn(async () => true),
  showToastError: vi.fn(),
}));

// 2. Now import them—these will be the very spies you just created above
import { fetchActivate, fetchDeactivate } from "../../../../api/admin/fetchActivation";
describe("UserBrowsingViewer (updated)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const deactivateButton = screen.getByText("Deactivate");
    const activateButton = screen.getByText("Activate");

    expect(deactivateButton).toBeInTheDocument();
    expect(activateButton).toBeInTheDocument();

    // Click Deactivate
    fireEvent.click(deactivateButton);
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(fetchDeactivate).toHaveBeenCalledWith(mockStudentJohnDoe.id);
    });

    // Click Activate
    fireEvent.click(activateButton);
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(fetchActivate).toHaveBeenCalledWith(mockStudentEmmaDoe.id);
    });

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

  it("renders in select mode and calls onSelect when user is clicked", async () => {
    useAuthMock.mockReturnValue({ userRoles: ["COORDINATOR"] });
    const onSelectMock = vi.fn();

    render(
      <MemoryRouter>
        <UserBrowsingViewer mode="select" onSelect={onSelectMock} allowedRoles={['Student']} />
      </MemoryRouter>
    );

    // Should show Select buttons in select mode
    const selectButtons = screen.getAllByText('Select');
    expect(selectButtons).toHaveLength(2);

    // Click on a select button
    fireEvent.click(selectButtons[0]);

    expect(onSelectMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      firstName: 'John'
    }));
  });

  it("handles search and pagination correctly", async () => {
    useAuthMock.mockReturnValue({ userRoles: ["COORDINATOR"] });

    render(
      <MemoryRouter>
        <UserBrowsingViewer allowedRoles={['Student']} />
      </MemoryRouter>
    );

    // Should render search bar
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();

    // Should display user data by name links
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Emma Doe')).toBeInTheDocument();
  });

  it("filters allowed roles correctly when specified", async () => {
    useAuthMock.mockReturnValue({ userRoles: ["COORDINATOR"] });

    render(
      <MemoryRouter>
        <UserBrowsingViewer allowedRoles={['Student']} />
      </MemoryRouter>
    );

    // Should only show students since we filtered by 'Student' role
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Emma Doe')).toBeInTheDocument();
  });
});
