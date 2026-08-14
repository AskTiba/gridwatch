import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

// Mock TanStack Router's Link component
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    className,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    activeProps?: { className?: string };
  }) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  it("renders the logo and brand name", () => {
    render(<Header />);
    expect(screen.getByText("MU")).toBeInTheDocument();
    expect(screen.getByText("Utility Monitor")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: /zones/i })).toHaveAttribute(
      "href",
      "/zones"
    );
    expect(screen.getByRole("link", { name: /incidents/i })).toHaveAttribute(
      "href",
      "/incidents"
    );
    expect(screen.getByRole("link", { name: /report/i })).toHaveAttribute(
      "href",
      "/report"
    );
  });

  it("renders as a sticky header", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky");
  });
});