import { render, screen, fireEvent } from "@testing-library/react";
import SideNavCoordinator from "./SidebarCoordinator";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

const mockLogout = vi.fn();

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));


vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({
      pathname: "/user/coordinator/home",
    }),
  };
});

describe("SideNavCoordinator", () => {
  it("renders without crashing", () => {
    render(
      <MemoryRouter>
        <SideNavCoordinator />
      </MemoryRouter>
    );
    expect(screen.queryByText("Courses Management")).not.toBeInTheDocument();
  });

  it("expands on hover and shows labels", () => {
    render(
      <MemoryRouter>
        <SideNavCoordinator />
      </MemoryRouter>
    );

    const sidebar = screen.getByRole("complementary"); 
    fireEvent.mouseEnter(sidebar);

    expect(screen.getByText("Courses Management")).toBeInTheDocument();
    expect(screen.getByText("TA Applications")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("calls logout on click", () => {
    render(
      <MemoryRouter>
        <SideNavCoordinator />
      </MemoryRouter>
    );

    fireEvent.mouseEnter(screen.getByRole("complementary"));
    fireEvent.click(screen.getByText("Logout"));

    expect(mockLogout).toHaveBeenCalled();
  });
});
