import { ServiceConfig, ServiceType } from "./types";

// Service configurations - each service can have its own Strapi instance
// Configure these in your .env.local file:
// NEXT_PUBLIC_NANNIES_API_URL=https://your-nannies-strapi.com
// NANNIES_API_TOKEN=your-bearer-token
// etc.

export const serviceConfigs: Record<ServiceType, ServiceConfig> = {
  nannies: {
    id: "nannies",
    name: "Nanny Services",
    apiUrl: "", // Use Next.js proxy
    endpoint: "/api/strapi/orders",
    authToken: process.env.NANNIES_API_TOKEN || "",
    color: "#0D363C",
    icon: "baby",
  },
  "gear-refresh": {
    id: "gear-refresh",
    name: "Gear Refresh Services",
    apiUrl: "", // Use Next.js proxy
    endpoint: "/api/strapi/orders",
    authToken: process.env.GEAR_REFRESH_API_TOKEN || "",
    color: "#10B981", // Green color for gear refresh
    icon: "settings",
  },
  "home-care": {
    id: "home-care",
    name: "Home Care Services",
    apiUrl: "", // Use Next.js proxy
    endpoint: "/api/strapi/home-care", // Dedicated home care endpoint
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
