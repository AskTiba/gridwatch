import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the brand description", () => {
    render(<Footer />);
    expect(
      screen.getByText(/community-driven infrastructure monitoring/i)
    ).toBeInTheDocument();
  });

  it("renders the open source badge", () => {
    render(<Footer />);
    expect(screen.getByText("Open Source")).toBeInTheDocument();
    expect(screen.getByText("Built for Communities")).toBeInTheDocument();
  });
});