"use client";

import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { DashboardStats } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "From Last Month",
  icon,
  variant = "secondary",
  className,
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  if (variant === "primary") {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl p-6 text-white relative overflow-hidden",
          className
        )}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{title}</p>
              <p className="text-4xl font-bold mt-1">{value}</p>
            </div>
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-success-50" : "text-red-300"
                )}
              >
                {isPositive ? "+" : ""}
                {change.toFixed(0)}%
              </span>
              <span className="text-sm text-white/60">{changeLabel}</span>
            </div>
          )}
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-white/5" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-sm transition-shadow",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isPositive ? (
            <TrendingUp className="size-4 text-success-500" />
          ) : (
            <TrendingDown className="size-4 text-brand-error" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-success-500" : "text-brand-error"
            )}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(0)}%
          </span>
          <span className="text-xs text-text-muted">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

interface StatsGridProps {
  stats: DashboardStats | null;
  currency?: string;
}

export function StatsGrid({ stats, currency = "AED" }: StatsGridProps) {
  if (!stats) {
    return <StatsGridSkeleton />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Primary stat */}
      <div className="lg:w-1/3">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue, currency)}
          change={stats.revenueChange}
          variant="primary"
          className="h-full"
        />
      </div>

      {/* Secondary stats */}
      <div className="lg:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Profit"
          value={formatCurrency(stats.totalProfit || 0, currency)}
          change={stats.profitChange || 0}
        />
        <StatCard
          title="Total Cost"
          value={formatCurrency(stats.totalCost || 0, currency)}
          change={-8} // This would need proper calculation for change percentage
        />
        <StatCard
          title="Total Leads"
          value={formatNumber(stats.totalOrders)}
          change={stats.ordersChange}
        />
      </div>
    </div>
  );
}

interface MiniStatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "success" | "warning" | "error" | "brand";
}

export function MiniStatCard({ title, value, icon, color }: MiniStatCardProps) {
  const colorClasses = {
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-100 text-warning-600",
    error: "bg-red-50 text-brand-error",
    brand: "bg-brand-primary/10 text-brand-primary",
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-10 rounded-lg flex items-center justify-center",
            colorClasses[color]
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-text-muted">{title}</p>
          <p className="text-xl font-bold text-text-primary">
            {formatNumber(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function OrderStatsRow({
  completed,
  pending,
  cancelled,
}: {
  completed: number;
  pending: number;
  cancelled: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <MiniStatCard
        title="Completed Orders"
        value={completed}
        icon={<CheckCircle className="size-5" />}
        color="success"
      />
      <MiniStatCard
        title="Pending Orders"
        value={pending}
        icon={<Clock className="size-5" />}
        color="warning"
      />
      <MiniStatCard
        title="Cancelled Orders"
        value={cancelled}
        icon={<XCircle className="size-5" />}
        color="error"
      />
    </div>
  );
}

// Loading skeleton
export function StatsGridSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="lg:w-1/3">
        <div className="bg-brand-primary/10 rounded-xl p-6 animate-pulse h-32">
          <div className="h-4 bg-brand-primary/20 rounded w-24 mb-2" />
          <div className="h-10 bg-brand-primary/20 rounded w-40" />
        </div>
      </div>
      <div className="lg:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse"
          >
            <div className="h-3 bg-neutral-100 rounded w-20 mb-2" />
            <div className="h-8 bg-neutral-100 rounded w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
