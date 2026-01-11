"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAllOrders,
  calculateDashboardStats,
  generateSalesChartData,
  getRecentTransactions,
  getTopProducts,
  calculateVisitorsByService,
  generateMonthlyEarningData,
  calculateServiceBreakdown,
  getTopCitiesByOrders,
  getTopCitiesByRevenue,
  getGeographicMarkers,
  getPeakHoursAnalysis,
  getWeeklyPatterns,
  getSeasonalTrends,
  getHighValueCustomers,
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

// Geographic Analytics Hooks
export function useTopCitiesByOrders(limit: number = 10) {
  const { data, isLoading, error } = useDashboardData();

  const cities = data ? getTopCitiesByOrders(data.byService, limit) : [];

  return {
    cities,
    isLoading,
    error,
  };
}

export function useTopCitiesByRevenue(limit: number = 10) {
  const { data, isLoading, error } = useDashboardData();

  const cities = data ? getTopCitiesByRevenue(data.byService, limit) : [];

  return {
    cities,
    isLoading,
    error,
  };
}

export function useGeographicMarkers() {
  const { data, isLoading, error } = useDashboardData();

  const markers = data ? getGeographicMarkers(data.byService) : [];

  return {
    markers,
    isLoading,
    error,
  };
}

// Temporal Analytics Hooks
export function usePeakHoursAnalysis(limit: number = 24) {
  const { data, isLoading, error } = useDashboardData();

  const peakHours = data ? getPeakHoursAnalysis(data.orders, limit) : [];

  return {
    peakHours,
    isLoading,
    error,
  };
}

export function useWeeklyPatterns() {
  const { data, isLoading, error } = useDashboardData();

  const weeklyPatterns = data ? getWeeklyPatterns(data.orders) : [];

  return {
    weeklyPatterns,
    isLoading,
    error,
  };
}

export function useSeasonalTrends() {
  const { data, isLoading, error } = useDashboardData();

  const seasonalTrends = data ? getSeasonalTrends(data.orders) : [];

  return {
    seasonalTrends,
    isLoading,
    error,
  };
}

// Customer Analytics Hooks
export function useHighValueCustomers(limit: number = 10) {
  const { data, isLoading, error } = useDashboardData();

  const customers = data ? getHighValueCustomers(data.orders, limit) : [];

  return {
    customers,
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

