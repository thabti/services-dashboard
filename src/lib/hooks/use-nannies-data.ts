"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAllOrders,
  calculateDashboardStats,
  generateSalesChartData,
  getRecentTransactions,
  getTopServices,
  generateEarningData,
  calculateRevenueProjection,
  calculateServiceGrowthProjection,
} from "@/lib/api";
import { ServiceType, Order } from "@/lib/types";

// Query key for nannies-specific data
export const nanniesQueryKey = ["orders", "nannies", "v2"] as const;

// Hook to fetch nannies-only dashboard data
export function useNanniesData() {
  const { data, isLoading, error } = useQuery({
    queryKey: nanniesQueryKey,
    queryFn: fetchAllOrders,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });

  console.log("🔍 useNanniesData - Raw data:", data);
  console.log("📊 useNanniesData - Is loading:", isLoading);
  console.log("❌ useNanniesData - Error:", error);

  // Filter to only nannies service
  const nanniesOrders = data?.byService?.nannies || [];
  console.log("👶 Nannies orders count:", nanniesOrders.length);
  if (nanniesOrders.length > 0) {
    console.log("👶 First nanny order sample:", nanniesOrders[0]);
  }

  // Create a filtered byService object with only nannies
  const filteredByService: Record<ServiceType, Order[]> = {
    nannies: nanniesOrders,
    "gear-refresh": [],
    "home-care": [],
  };

  // Calculate stats for nannies only
  const stats =
    nanniesOrders.length > 0 ? calculateDashboardStats(nanniesOrders) : null;

  // Generate chart data for nannies only
  const chartData =
    nanniesOrders.length > 0 ? generateSalesChartData(nanniesOrders) : [];
  console.log("📈 Chart data generated:", chartData.length, "data points");
  if (chartData.length > 0) {
    console.log("📈 First chart data point:", chartData[0]);
  }

  // Generate earning data for nannies only
  const earningData =
    nanniesOrders.length > 0 ? generateEarningData(nanniesOrders) : [];

  // Get recent transactions for nannies only
  const transactions =
    nanniesOrders.length > 0
      ? getRecentTransactions(filteredByService, 5)
      : [];

  // Get top services (will show just nannies)
  const topServices =
    nanniesOrders.length > 0 ? getTopServices(filteredByService, 3) : [];

  // Calculate projections
  const revenueProjection = nanniesOrders.length > 0
    ? calculateRevenueProjection(nanniesOrders, 6)
    : [];

  const serviceGrowthProjection = data?.byService
    ? calculateServiceGrowthProjection(data.byService, 6)
    : { nannies: [], "gear-refresh": [], "home-care": [] };

  return {
    orders: nanniesOrders,
    stats,
    chartData,
    earningData,
    transactions,
    topServices,
    revenueProjection,
    serviceGrowthProjection,
    isLoading,
    error,
  };
}
