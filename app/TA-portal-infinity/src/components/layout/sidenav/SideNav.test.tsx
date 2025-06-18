import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import SideNav from "./SideNav";
import { AuthProvider } from "../../../context/AuthContext";

const renderWithProviders = (ui: React.ReactElement, initialRoute = "/") => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  );
};

describe("SideNav", () => {
  it("lists all nav items", () => {
    renderWithProviders(<SideNav />);

    ["Home", "About"].forEach((label) =>
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument()
    );
  });
});

  it("highlights the active path", () => {
    renderWithProviders(<SideNav />, "/about");

    const active = screen.getByRole("link", { name: "About" });
    expect(active.className).toMatch(/bg-sky-700/); 
});
