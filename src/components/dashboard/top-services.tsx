"use client";

import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { TopService } from "@/lib/types";
import { ArrowUpRight, Baby, Car, Home } from "lucide-react";

interface TopServicesProps {
  services: TopService[];
  className?: string;
}

const serviceIcons: Record<string, React.ReactNode> = {
  nannies: <Baby className="size-6 text-brand-primary" />,
  "car-seat": <Car className="size-6 text-success-500" />,
  "home-care": <Home className="size-6 text-brand-accent" />,
};

const serviceColors: Record<string, string> = {
  nannies: "bg-brand-primary/10",
  "car-seat": "bg-success-50",
  "home-care": "bg-brand-accent/10",
};

export function TopServices({ services, className }: TopServicesProps) {
  return (
    <div className={cn("bg-white border border-neutral-200 rounded-xl", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <h3 className="font-semibold text-text-primary">Top Selling Product</h3>
        <button className="text-sm text-brand-primary hover:underline flex items-center gap-1">
          See All Product
          <ArrowUpRight className="size-3" />
        </button>
      </div>

      <div className="divide-y divide-neutral-100">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors"
          >
            {/* Service Icon */}
            <div
              className={cn(
                "size-14 rounded-xl flex items-center justify-center",
                serviceColors[service.service] || "bg-neutral-100"
              )}
            >
              {serviceIcons[service.service] || (
                <div className="size-6 bg-neutral-200 rounded" />
              )}
            </div>

            {/* Service Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary truncate">
                {service.name}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                {formatNumber(service.orders)} orders
              </p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-success-600">
                <span className="size-1.5 rounded-full bg-success-500" />
                Available
              </span>
            </div>

            {/* Price & Revenue */}
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary">
                {formatCurrency(service.revenue / (service.orders || 1), service.currency)}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Total Sales: {formatCurrency(service.revenue, service.currency)}
              </p>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-text-muted">No services yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
export function TopServicesSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl animate-pulse">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div className="h-5 bg-neutral-100 rounded w-36" />
        <div className="h-4 bg-neutral-100 rounded w-28" />
      </div>
      <div className="divide-y divide-neutral-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <div className="size-14 rounded-xl bg-neutral-100" />
            <div className="flex-1">
              <div className="h-4 bg-neutral-100 rounded w-40 mb-1" />
              <div className="h-3 bg-neutral-100 rounded w-20 mb-2" />
              <div className="h-4 bg-neutral-100 rounded-full w-16" />
            </div>
            <div className="text-right">
              <div className="h-4 bg-neutral-100 rounded w-16 mb-1" />
              <div className="h-3 bg-neutral-100 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
