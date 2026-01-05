"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAllOrders,
  calculateDashboardStats,
  generateSalesChartData,
  getRecentTransactions,
  getTopProducts,
  generateEarningData,
  calculateRevenueProjection,
  calculateServiceGrowthProjection,
} from "@/lib/api";
import { ServiceType, Order } from "@/lib/types";

// Query key for gear-refresh-specific data
export const gearRefreshQueryKey = ["orders", "gear-refresh", "v2"] as const;

// Hook to fetch gear-refresh-only dashboard data
export function useGearRefreshData() {
  const { data, isLoading, error } = useQuery({
    queryKey: gearRefreshQueryKey,
    queryFn: fetchAllOrders,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });

  console.log("🔍 useGearRefreshData - Raw data:", data);
  console.log("📊 useGearRefreshData - Is loading:", isLoading);
  console.log("❌ useGearRefreshData - Error:", error);

  // Filter to only gear-refresh service
  const gearRefreshOrders = data?.byService?.["gear-refresh"] || [];
  console.log("🔧 Gear Refresh orders count:", gearRefreshOrders.length);
  if (gearRefreshOrders.length > 0) {
    console.log("🔧 First gear refresh order sample:", gearRefreshOrders[0]);
  }

  // Create a filtered byService object with only gear-refresh
  const filteredByService: Record<ServiceType, Order[]> = {
    nannies: [],
    "gear-refresh": gearRefreshOrders,
    "home-care": [],
  };

  // Calculate stats for gear-refresh only
  const stats =
    gearRefreshOrders.length > 0 ? calculateDashboardStats(gearRefreshOrders) : null;

  // Generate chart data for gear-refresh only
  const chartData =
    gearRefreshOrders.length > 0 ? generateSalesChartData(gearRefreshOrders) : [];
  console.log("📈 Chart data generated:", chartData.length, "data points");
  if (chartData.length > 0) {
    console.log("📈 First chart data point:", chartData[0]);
  }

  // Generate earning data for gear-refresh only
  const earningData =
    gearRefreshOrders.length > 0 ? generateEarningData(gearRefreshOrders) : [];

  // Get recent transactions for gear-refresh only
  const transactions =
    gearRefreshOrders.length > 0
      ? getRecentTransactions(filteredByService, 5)
      : [];

  // Get top products for gear-refresh (Car Seat Installation by price)
  const topServices =
    gearRefreshOrders.length > 0 ? getTopProducts(filteredByService, 3) : [];

  // Calculate projections
  const revenueProjection = gearRefreshOrders.length > 0
    ? calculateRevenueProjection(gearRefreshOrders, 6)
    : [];

  const serviceGrowthProjection = data?.byService
    ? calculateServiceGrowthProjection(data.byService, 6)
    : { nannies: [], "gear-refresh": [], "home-care": [] };

  return {
    orders: gearRefreshOrders,
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