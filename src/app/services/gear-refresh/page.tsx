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

export default function GearRefreshServicePage() {
  const {
    stats,
    chartData,
    earningData,
    transactions,
    topServices,
    revenueProjection,
    isLoading
  } = useGearRefreshData();

  return (
    <div className="max-w-7xl mx-auto">
       {/* Header */}
       <div className="mb-6">
         <Header title="Gear Refresh Services" subtitle="Analytics for gear refresh orders" />
       </div>

      {/* Data Period Banner */}
      <div className="mb-6 bg-neutral-50 border border-neutral-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-neutral-600">
            Showing analytics for the last 3 months of service orders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <StatsGridSkeleton />
      ) : stats ? (
        <>
          <StatsGrid stats={stats} />
          <OrderStatsRow
            completed={stats.completedOrders || 0}
            pending={stats.pendingOrders || 0}
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
            <EarningsChart data={earningData} />
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
