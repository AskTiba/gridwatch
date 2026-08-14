import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MapView } from "./MapView";

describe("MapView", () => {
  it("renders a map container div", () => {
    const { container } = render(
      <MapView
        incidents={[]}
        center={[-33.9249, 18.4241]}
        zoom={12}
        className="h-[400px]"
      />
    );
    const mapDiv = container.querySelector(".rounded-lg");
    expect(mapDiv).toBeInTheDocument();
  });

  it("applies className to container", () => {
    const { container } = render(
      <MapView
        incidents={[]}
        center={[-33.9249, 18.4241]}
        zoom={12}
        className="h-[400px]"
      />
    );
    expect(container.firstChild).toHaveClass("h-[400px]");
  });

  it("renders with default center and zoom", () => {
    const { container } = render(<MapView incidents={[]} />);
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
  });

  it("renders with incident clusters", () => {
    const incidents = [
      { id: "1", lat: -33.92, lng: 18.42, count: 3, type: "power_cut" as const },
      { id: "2", lat: -33.93, lng: 18.43, count: 1, type: "water_leak" as const },
    ];
    const { container } = render(<MapView incidents={incidents} />);
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
  });
});