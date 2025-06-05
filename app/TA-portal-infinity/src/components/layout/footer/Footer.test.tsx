//example test. redo it later.

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from "./Footer";

describe("Footer", () => {
  it("shows the current year and legal links", () => {
    render(<Footer />);

    const year = new Date().getFullYear().toString();
    expect(screen.getByText(year, { exact: false })).toBeInTheDocument();

    ["Terms of Use", "Privacy", "Accessibility"].forEach((text) =>
      expect(screen.getByRole("link", { name: text })).toBeInTheDocument()
    );
  });
});
