"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAllOrders,
  calculateDashboardStats,
  calculateServiceBreakdown,
  generateSalesChartData,
  getRecentTransactions,
  getTopProducts,
  calculateVisitorsByService,
  generateMonthlyEarningData,
} from "@/lib/api";

// Query keys
export const queryKeys = {
  allOrders: ["orders", "all"] as const,
  dashboard: ["dashboard"] as const,
};

// Main hook to fetch all dashboard data
export function useDashboardData() {
  return useQuery({
    queryKey: queryKeys.allOrders,
    queryFn: fetchAllOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}

// Hook to get dashboard stats
export function useDashboardStats() {
  const { data, isLoading, error } = useDashboardData();

  console.log("📊 useDashboardStats:", { data: !!data, isLoading, error });

  const stats = data ? calculateDashboardStats(data.orders) : null;

  console.log("Calculated stats:", stats);

  return {
    stats,
    isLoading,
    error,
  };
}

// Hook to get service breakdown for pie/donut chart
export function useServiceBreakdown() {
  const { data, isLoading, error } = useDashboardData();

  const breakdown = data ? calculateServiceBreakdown(data.byService) : [];

  return {
    breakdown,
    isLoading,
    error,
  };
}

// Hook to get sales chart data
export function useSalesChartData() {
  const { data, isLoading, error } = useDashboardData();

  const chartData = data ? generateSalesChartData(data.orders) : [];

  return {
    chartData,
    isLoading,
    error,
  };
}

// Hook to get recent transactions
export function useRecentTransactions(limit: number = 10) {
  const { data, isLoading, error } = useDashboardData();

  const transactions = data ? getRecentTransactions(data.byService, limit) : [];

  return {
    transactions,
    isLoading,
    error,
  };
}

// Hook to get top selling products across all services
export function useTopServices(limit: number = 5) {
  const { data, isLoading, error } = useDashboardData();

  const topServices = data ? getTopProducts(data.byService, limit) : [];

  return {
    topServices,
    isLoading,
    error,
  };
}

// Hook to get visitors by service (for bar chart)
export function useVisitorsByService() {
  const { data, isLoading, error } = useDashboardData();

  const visitors = data ? calculateVisitorsByService(data.byService) : [];

  return {
    visitors,
    isLoading,
    error,
  };
}

// Hook to get earning chart data (3-month comparison by weeks)
export function useEarningData() {
  const { data, isLoading, error } = useDashboardData();

  const earningData = data ? generateMonthlyEarningData(data.orders) : [];

  return {
    earningData,
    isLoading,
    error,
  };
}

