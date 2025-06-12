import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Header from "./Header";

describe("Header", () => {
  it("renders UBC logo and branding text", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // To check UBC logo
    const ubcLogo = screen.getByAltText(/UBC logo/i);
    expect(ubcLogo).toBeInTheDocument();
    expect(ubcLogo).toHaveAttribute("src", expect.stringContaining("ubc-logo"));

    // To check branding text
    expect(
      screen.getByText(/University of British Columbia/i)
    ).toBeInTheDocument();
  });

  it("renders TA Portal icon with link to homepage", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Check for grad cap icon
    const capIcon = screen.getByAltText(/Grad cap/i);
    expect(capIcon).toBeInTheDocument();
    expect(capIcon).toHaveAttribute("src", expect.stringContaining("grad-cap"));

    // Both images should be wrapped in links
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);

    // All should link to home
    links.forEach(link => {
      expect(link).toHaveAttribute("href", "/");
    });
  });
});
