import { ServiceConfig, ServiceType } from "./types";

// Environment variable to enable mock data
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || true;

// Service configurations - each service can have its own Strapi instance
// Configure these in your .env.local file:
// NEXT_PUBLIC_NANNIES_API_URL=https://your-nannies-strapi.com
// NANNIES_API_TOKEN=your-bearer-token
// etc.

export const serviceConfigs: Record<ServiceType, ServiceConfig> = {
  nannies: {
    id: "nannies",
    name: "Nanny Services",
    apiUrl: process.env.NEXT_PUBLIC_NANNIES_API_URL || "http://localhost:1337",
    endpoint: "/api/orders",
    authToken: process.env.NANNIES_API_TOKEN || "",
    color: "#0D363C",
    icon: "baby",
  },
  "car-seat": {
    id: "car-seat",
    name: "Car Seat Services",
    apiUrl: process.env.NEXT_PUBLIC_CAR_SEAT_API_URL || "http://localhost:1338",
    endpoint: "/api/orders",
    authToken: process.env.CAR_SEAT_API_TOKEN || "",
    color: "#4c6c5a",
    icon: "car",
  },
  "home-care": {
    id: "home-care",
    name: "Home Care Services",
    apiUrl: process.env.NEXT_PUBLIC_HOME_CARE_API_URL || "http://localhost:1339",
    endpoint: "/api/service-requests",
    authToken: process.env.HOME_CARE_API_TOKEN || "",
    color: "#D4AF37",
    icon: "home",
  },
};

// Add more services dynamically
export function addServiceConfig(config: ServiceConfig): void {
  serviceConfigs[config.id] = config;
}

// Get all service configs as array
export const allServices = Object.values(serviceConfigs);

export function getServiceConfig(serviceType: ServiceType): ServiceConfig {
  return serviceConfigs[serviceType];
}

export function getServiceColor(serviceType: ServiceType): string {
  return serviceConfigs[serviceType].color;
}

export function getServiceName(serviceType: ServiceType): string {
  return serviceConfigs[serviceType].name;
}

// Example of adding a new service at runtime:
// addServiceConfig({
//   id: "pet-care" as ServiceType,
//   name: "Pet Care Services",
//   apiUrl: "https://pet-care-strapi.example.com",
//   endpoint: "/api/orders",
//   authToken: "your-token-here",
//   color: "#9B59B6",
//   icon: "paw-print",
// });
