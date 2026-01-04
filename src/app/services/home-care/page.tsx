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
import { useHomeCareData } from "@/lib/hooks/use-home-care-data";

export default function HomeCareServicePage() {
  const {
    stats,
    chartData,
    earningData,
    transactions,
    topServices,
    revenueProjection,
    isLoading
  } = useHomeCareData();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Header title="Home Care Services" subtitle="Analytics for home care orders" />
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
