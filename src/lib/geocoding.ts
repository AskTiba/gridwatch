import { createServerFn } from "@tanstack/react-start";

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    village?: string;
    parish?: string;
    suburb?: string;
    neighbourhood?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

export const reverseGeocode = createServerFn({ method: "GET" })
  .validator((input: { lat: number; lng: number }) => input)
  .handler(async ({ data }) => {
    const { lat, lng } = data;

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "GridWatch/1.0 (citizen-utility-reporting)",
      },
    });

    if (!res.ok) {
      return { area: null, neighborhood: null, municipality: null };
    }

    const result: NominatimResult = await res.json();
    const addr = result.address;

    // Extract the most meaningful area name for Uganda context
    const area =
      addr.village ||
      addr.parish ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.town ||
      addr.city ||
      null;

    const neighborhood =
      addr.parish || addr.suburb || addr.neighbourhood || null;

    const municipality =
      addr.city || addr.town || addr.municipality || addr.county || null;

    return { area, neighborhood, municipality };
  });
