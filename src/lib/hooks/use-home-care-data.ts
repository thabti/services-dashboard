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

// Query key for home-care-specific data
export const homeCareQueryKey = ["orders", "home-care", "v2"] as const;

// Hook to fetch home-care-only dashboard data
export function useHomeCareData() {
  const { data, isLoading, error } = useQuery({
    queryKey: homeCareQueryKey,
    queryFn: fetchAllOrders,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });

  console.log("🔍 useHomeCareData - Raw data:", data);
  console.log("📊 useHomeCareData - Is loading:", isLoading);
  console.log("❌ useHomeCareData - Error:", error);

  // Filter to only home-care service
  const homeCareOrders = data?.byService?.["home-care"] || [];
  console.log("🏠 Home Care orders count:", homeCareOrders.length);
  if (homeCareOrders.length > 0) {
    console.log("🏠 First home care order sample:", homeCareOrders[0]);
  }

  // Create a filtered byService object with only home-care
  const filteredByService: Record<ServiceType, Order[]> = {
    nannies: [],
    "car-seat": [],
    "home-care": homeCareOrders,
  };

  // Calculate stats for home-care only
  const stats =
    homeCareOrders.length > 0 ? calculateDashboardStats(homeCareOrders) : null;

  // Generate chart data for home-care only
  const chartData =
    homeCareOrders.length > 0 ? generateSalesChartData(homeCareOrders) : [];
  console.log("📈 Chart data generated:", chartData.length, "data points");
  if (chartData.length > 0) {
    console.log("📈 First chart data point:", chartData[0]);
  }

  // Generate earning data for home-care only
  const earningData =
    homeCareOrders.length > 0 ? generateEarningData(homeCareOrders) : [];

  // Get recent transactions for home-care only
  const transactions =
    homeCareOrders.length > 0
      ? getRecentTransactions(filteredByService, 5)
      : [];

  // Get top services (will show just home-care)
  const topServices =
    homeCareOrders.length > 0 ? getTopServices(filteredByService, 3) : [];

  // Calculate projections
  const revenueProjection = homeCareOrders.length > 0
    ? calculateRevenueProjection(homeCareOrders, 6)
    : [];

  const serviceGrowthProjection = data?.byService
    ? calculateServiceGrowthProjection(data.byService, 6)
    : { nannies: [], "car-seat": [], "home-care": [] };

  return {
    orders: homeCareOrders,
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
