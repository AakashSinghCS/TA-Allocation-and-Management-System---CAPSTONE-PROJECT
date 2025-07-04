import { render, screen, fireEvent } from "@testing-library/react";
import SideNavStudent from "./SidebarStudent";
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
      pathname: "/user/student/home",
    }),
  };
});

describe("SideNavStudent", () => {
  it("renders collapsed by default", () => {
    render(
      <MemoryRouter>
        <SideNavStudent />
      </MemoryRouter>
    );

    expect(screen.queryByText("My Courses")).not.toBeInTheDocument();
  });

  it("expands and shows labels on hover", () => {
    render(
      <MemoryRouter>
        <SideNavStudent />
      </MemoryRouter>
    );

    const sidebar = screen.getByRole("complementary");
    fireEvent.mouseEnter(sidebar);

    expect(screen.getByText("View Applications")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("triggers logout on click", () => {
    render(
      <MemoryRouter>
        <SideNavStudent />
      </MemoryRouter>
    );

    fireEvent.mouseEnter(screen.getByRole("complementary"));
    fireEvent.click(screen.getByText("Logout"));

    expect(mockLogout).toHaveBeenCalled();
  });
});
