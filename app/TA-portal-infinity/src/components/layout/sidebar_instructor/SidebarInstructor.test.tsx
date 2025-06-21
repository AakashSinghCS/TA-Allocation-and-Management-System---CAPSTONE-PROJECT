import { render, screen, fireEvent } from "@testing-library/react";
import SideNavInstructor from "./SidebarInstructor";
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
      pathname: "/user/instructor/home",
    }),
  };
});

describe("SideNavInstructor", () => {
  it("renders without crashing", () => {
    render(
      <MemoryRouter>
        <SideNavInstructor />
      </MemoryRouter>
    );

    expect(screen.queryByText("TA Requirements")).not.toBeInTheDocument();
  });

  it("expands on hover and shows menu labels", () => {
    render(
      <MemoryRouter>
        <SideNavInstructor />
      </MemoryRouter>
    );

    const sidebar = screen.getByRole("complementary"); 
    fireEvent.mouseEnter(sidebar);

    expect(screen.getByText("TA Requirements")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("calls logout when logout button is clicked", () => {
    render(
      <MemoryRouter>
        <SideNavInstructor />
      </MemoryRouter>
    );

    fireEvent.mouseEnter(screen.getByRole("complementary"));
    fireEvent.click(screen.getByText("Logout"));

    expect(mockLogout).toHaveBeenCalled();
  });
});
