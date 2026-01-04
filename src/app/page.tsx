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
  VisitorsChart,
  VisitorsChartSkeleton,
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
import {
  useDashboardStats,
  useSalesChartData,
  useVisitorsByService,
  useEarningData,
  useRecentTransactions,
  useTopServices,
} from "@/lib/hooks/use-dashboard-data";
import { ChevronDown } from "lucide-react";

export default function Dashboard() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { chartData, isLoading: chartLoading } = useSalesChartData();
  const { visitors, isLoading: visitorsLoading } = useVisitorsByService();
  const { earningData, isLoading: earningsLoading } = useEarningData();
  const { transactions, isLoading: transactionsLoading } = useRecentTransactions(5);
  const { topServices, isLoading: servicesLoading } = useTopServices(3);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Header
          title="Overview"
          subtitle="Here's your analytic for:"
        />
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2 mb-6">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-text-primary hover:border-brand-primary/30 transition-colors">
          This Month
          <ChevronDown className="size-4 text-text-muted" />
        </button>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Sales Chart */}
        <div className="lg:col-span-1">
          {chartLoading ? (
            <SalesChartSkeleton />
          ) : (
            <SalesChart data={chartData} />
          )}
        </div>

        {/* Visitors Chart */}
        <div className="lg:col-span-1">
          {visitorsLoading ? (
            <VisitorsChartSkeleton />
          ) : (
            <VisitorsChart data={visitors} />
          )}
        </div>

        {/* Earnings Chart */}
        <div className="lg:col-span-1">
          {earningsLoading ? (
            <EarningsChartSkeleton />
          ) : (
            <EarningsChart data={earningData} />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Transactions */}
        <div>
          {transactionsLoading ? (
            <RecentTransactionsSkeleton />
          ) : (
            <RecentTransactions transactions={transactions} />
          )}
        </div>

        {/* Top Services */}
        <div>
          {servicesLoading ? (
            <TopServicesSkeleton />
          ) : (
            <TopServices services={topServices} />
          )}
        </div>
      </div>
    </div>
  );
}
