//example test. redo it later.

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Header from "./Header";

describe("Header", () => {
  it("renders university branding and app title", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // the text next to the crest
    expect(
      screen.getByText(/University of British Columbia/i)
    ).toBeInTheDocument();

    // link back to home
    const homeLink = screen.getByRole("link", { name: /TA Portal/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
