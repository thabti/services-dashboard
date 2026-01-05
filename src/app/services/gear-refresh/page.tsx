"use client";

import { Header } from "@/components/layout/header";
import {
  StatsGrid,
  StatsGridSkeleton,
  OrderStatsRow,
} from "@/components/dashboard/stat-cards";
import {
  SalesChart,
  SalesChartSkeleton,
  EarningsChart,
  EarningsChartSkeleton,
} from "@/components/charts";
import {
  RecentTransactions,
  RecentTransactionsSkeleton,
} from "@/components/dashboard/recent-transactions";
import {
  TopServices,
  TopServicesSkeleton,
} from "@/components/dashboard/top-services";
import { useGearRefreshData } from "@/lib/hooks/use-gear-refresh-data";
import { Settings } from "lucide-react";

export default function GearRefreshServicePage() {
  const {
    stats,
    chartData,
    earningData,
    transactions,
    topServices,
    revenueProjection,
    serviceGrowthProjection,
    isLoading
  } = useGearRefreshData();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Header title="Gear Refresh Services" subtitle="Analytics for gear refresh orders" />
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2 mb-6">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-text-primary hover:border-brand-primary/30 transition-colors">
          This Month
          <Settings className="size-4 text-text-muted" />
        </button>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <StatsGridSkeleton />
      ) : stats ? (
        <>
          <StatsGrid stats={stats} />
          <OrderStatsRow
            completed={stats.completedOrders}
            pending={stats.pendingOrders}
            cancelled={stats.cancelledOrders}
          />
        </>
      ) : null}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div>
          {isLoading ? (
            <SalesChartSkeleton />
          ) : (
            <SalesChart data={chartData} projections={revenueProjection} />
          )}
        </div>
        <div>
          {isLoading ? (
            <EarningsChartSkeleton />
          ) : (
            <EarningsChart data={earningData} projections={revenueProjection} />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div>
          {isLoading ? (
            <RecentTransactionsSkeleton />
          ) : (
            <RecentTransactions transactions={transactions} />
          )}
        </div>
        <div>
          {isLoading ? (
            <TopServicesSkeleton />
          ) : (
            <TopServices services={topServices} />
          )}
        </div>
      </div>
    </div>
  );
}