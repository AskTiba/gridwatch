import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

export interface IncidentCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  type: "power_cut" | "water_leak" | "pothole" | "street_light" | "other";
}

interface MapViewProps {
  incidents: IncidentCluster[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function MapView({
  incidents,
  center = [0.3476, 32.5825],
  zoom = 12,
  className,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    async function initMap() {
      const L = await import("leaflet");

      // Import CSS dynamically
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Add incident markers
      const markerIcon = L.divIcon({
        className: "incident-marker",
        html: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      incidents.forEach((incident) => {
        const marker = L.marker([incident.lat, incident.lng], {
          icon: markerIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <strong>${incident.type.replace("_", " ").toUpperCase()}</strong>
            <br/>
            ${incident.count} report${incident.count > 1 ? "s" : ""}
          </div>
        `);
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [isClient, incidents, center, zoom]);

  if (!isClient) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-[var(--color-surface)] ${className ?? ""}`}
      >
        <p className="text-sm text-[var(--color-text-muted)]">Loading map...</p>
      </div>
    );
  }

  return <div ref={mapRef} className={`rounded-lg ${className ?? ""}`} />;
}