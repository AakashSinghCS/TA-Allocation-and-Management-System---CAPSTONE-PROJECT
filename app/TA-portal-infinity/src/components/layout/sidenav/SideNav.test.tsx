////example test. redo it later.

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import SideNav from "./SideNav";

describe("SideNav", () => {
  it("lists all nav items", () => {
    render(
      <MemoryRouter>
        <SideNav />
      </MemoryRouter>
    );

    ["Home", "About"].forEach(
      (label) => expect(screen.getByRole("link", { name: label })).toBeInTheDocument()
    );
  });

  it("highlights the active path", () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <SideNav />
      </MemoryRouter>
    );

    const active = screen.getByRole("link", { name: "About" });
    // uses the Tailwind class we set for the active state
    expect(active.className).toMatch(/bg-sky-700/);
  });
});
