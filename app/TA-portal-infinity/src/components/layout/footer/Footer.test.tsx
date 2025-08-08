import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";          
import { describe, it, expect } from "vitest";
import Footer from "./Footer";


const expectIcon = (alt: string | RegExp) => {
  expect(screen.getByAltText(alt)).toBeInTheDocument();
};

describe("Footer", () => {
  it("renders the UBC logo", () => {
    render(<Footer />);
    expectIcon(/UBC logo/i);
  });

  it("renders all legal/help links", () => {
    render(<Footer />);
    [
      "Terms of Use",
      "Accessibility",
      "Privacy",
      "Copyright",
      "Need Help?",
    ].forEach(text =>
      expect(
        screen.getByRole("link", { name: text })
      ).toBeInTheDocument()
    );
  });

  it("renders the social-media icons with correct alts", () => {
    render(<Footer />);
    expectIcon(/Twitter/i);
    expectIcon(/Instagram/i);
    expectIcon(/YouTube/i);
    expectIcon(/LinkedIn/i);
  });
});
