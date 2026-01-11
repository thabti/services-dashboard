"use client";

import { useState, useEffect } from "react";
import { GeographicMarker } from "@/lib/types";
import { MapComponent } from "./map-component";

interface ServiceMapProps {
  markers: GeographicMarker[];
  title: string;
}

const serviceColors: Record<string, string> = {
  nannies: "#FF6B6B",
  "gear-refresh": "#4ECDC4",
  "home-care": "#45B7D1",
};

export function ServiceMap({ markers, title }: ServiceMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate center point from markers
  const center: [number, number] = markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : [25.276987, 55.296249]; // Default to Dubai

  if (!isClient) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
        <div className="h-96 bg-neutral-100 rounded-lg flex items-center justify-center">
          <p className="text-neutral-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>

      <div className="h-96 w-full">
        <MapComponent markers={markers} center={center} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {Object.entries(serviceColors).map(([service, color]) => (
          <div key={service} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm text-gray-600 capitalize">
              {service.replace('-', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for loading state
export function ServiceMapSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
      <div className="h-5 bg-neutral-200 rounded w-48 mb-4"></div>
      <div className="h-96 bg-neutral-100 rounded-lg"></div>
      <div className="mt-4 flex gap-4">
        <div className="h-4 bg-neutral-200 rounded w-20"></div>
        <div className="h-4 bg-neutral-200 rounded w-24"></div>
        <div className="h-4 bg-neutral-200 rounded w-16"></div>
      </div>
    </div>
  );
}