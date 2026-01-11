"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAllOrders,
  calculateDashboardStats,
  generateSalesChartData,
  getRecentTransactions,
  getTopProducts,
  generateMonthlyEarningData,
  calculateRevenueProjection,
  calculateServiceGrowthProjection,
  getTopCitiesByOrders,
  getTopCitiesByRevenue,
  getGeographicMarkers,
  getPeakHoursAnalysis,
  getWeeklyPatterns,
  getSeasonalTrends,
  getHighValueCustomers,
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

  // Calculate stats for gear-refresh only (with gear-refresh-specific profit margins)
  const stats =
    gearRefreshOrders.length > 0 ? calculateDashboardStats(gearRefreshOrders, [], "gear-refresh") : null;

  // Generate chart data for gear-refresh only
  const chartData =
    gearRefreshOrders.length > 0 ? generateSalesChartData(gearRefreshOrders) : [];
  console.log("📈 Chart data generated:", chartData.length, "data points");
  if (chartData.length > 0) {
    console.log("📈 First chart data point:", chartData[0]);
  }

  // Generate monthly earning data for gear-refresh only (3-month comparison)
  const earningData =
    gearRefreshOrders.length > 0 ? generateMonthlyEarningData(gearRefreshOrders) : [];

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

  // Geographic analytics
  const topCitiesByOrders = gearRefreshOrders.length > 0
    ? getTopCitiesByOrders(filteredByService, 5)
    : [];
  const topCitiesByRevenue = gearRefreshOrders.length > 0
    ? getTopCitiesByRevenue(filteredByService, 5)
    : [];
  const geographicMarkers = gearRefreshOrders.length > 0
    ? getGeographicMarkers(filteredByService)
    : [];

  // Temporal analytics
  const peakHours = gearRefreshOrders.length > 0
    ? getPeakHoursAnalysis(gearRefreshOrders, 10)
    : [];
  const weeklyPatterns = gearRefreshOrders.length > 0
    ? getWeeklyPatterns(gearRefreshOrders)
    : [];
  const seasonalTrends = gearRefreshOrders.length > 0
    ? getSeasonalTrends(gearRefreshOrders)
    : [];

  // Customer analytics
  const highValueCustomers = gearRefreshOrders.length > 0
    ? getHighValueCustomers(gearRefreshOrders, 5)
    : [];

  return {
    orders: gearRefreshOrders,
    stats,
    chartData,
    earningData,
    transactions,
    topServices,
    revenueProjection,
    serviceGrowthProjection,
    // Geographic data
    topCitiesByOrders,
    topCitiesByRevenue,
    geographicMarkers,
    // Temporal data
    peakHours,
    weeklyPatterns,
    seasonalTrends,
    // Customer data
    highValueCustomers,
    isLoading,
    error,
  };
}