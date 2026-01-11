"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { GeographicMarker } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  markers: GeographicMarker[];
  center: [number, number];
}

export function MapComponent({ markers, center }: MapComponentProps) {
  const serviceColors: Record<string, string> = {
    nannies: "#FF6B6B",
    "gear-refresh": "#4ECDC4",
    "home-care": "#45B7D1",
  };

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker) => {
        const color = serviceColors[marker.serviceType] || "#8884d8";
        const radius = Math.max(500, Math.min(5000, marker.totalRevenue / 10)); // Scale radius by revenue

        return (
          <div key={marker.id}>
            <Circle
              center={[marker.lat, marker.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold">{marker.city}, {marker.country}</h4>
                  <p className="text-sm text-gray-600">
                    Service: {marker.serviceType.replace('-', ' ').toUpperCase()}
                  </p>
                  <p className="text-sm">
                    Orders: <span className="font-medium">{marker.orderCount}</span>
                  </p>
                  <p className="text-sm">
                    Revenue: <span className="font-medium">{formatCurrency(marker.totalRevenue)}</span>
                  </p>
                </div>
              </Popup>
            </Circle>

            <Marker position={[marker.lat, marker.lng]}>
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold">{marker.city}, {marker.country}</h4>
                  <p className="text-sm text-gray-600">
                    Service: {marker.serviceType.replace('-', ' ').toUpperCase()}
                  </p>
                  <p className="text-sm">
                    Orders: <span className="font-medium">{marker.orderCount}</span>
                  </p>
                  <p className="text-sm">
                    Revenue: <span className="font-medium">{formatCurrency(marker.totalRevenue)}</span>
                  </p>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}
    </MapContainer>
  );
}