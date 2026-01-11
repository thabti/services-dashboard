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

  // Calculate stats for nannies only (with nannies-specific profit margins)
  const stats =
    nanniesOrders.length > 0 ? calculateDashboardStats(nanniesOrders, [], "nannies") : null;

  // Generate chart data for nannies only
  const chartData =
    nanniesOrders.length > 0 ? generateSalesChartData(nanniesOrders) : [];
  console.log("📈 Chart data generated:", chartData.length, "data points");
  if (chartData.length > 0) {
    console.log("📈 First chart data point:", chartData[0]);
  }

  // Generate monthly earning data for nannies only (3-month comparison)
  const earningData =
    nanniesOrders.length > 0 ? generateMonthlyEarningData(nanniesOrders) : [];

  // Get recent transactions for nannies only
  const transactions =
    nanniesOrders.length > 0
      ? getRecentTransactions(filteredByService, 5)
      : [];

  // Get top products for nannies (Daily, Weekly, Monthly Nanny)
  const topServices =
    nanniesOrders.length > 0 ? getTopProducts(filteredByService, 3) : [];

  // Calculate projections
  const revenueProjection = nanniesOrders.length > 0
    ? calculateRevenueProjection(nanniesOrders, 6)
    : [];

  const serviceGrowthProjection = data?.byService
    ? calculateServiceGrowthProjection(data.byService, 6)
    : { nannies: [], "gear-refresh": [], "home-care": [] };

  // Geographic analytics
  const topCitiesByOrders = nanniesOrders.length > 0
    ? getTopCitiesByOrders(filteredByService, 5)
    : [];
  const topCitiesByRevenue = nanniesOrders.length > 0
    ? getTopCitiesByRevenue(filteredByService, 5)
    : [];
  const geographicMarkers = nanniesOrders.length > 0
    ? getGeographicMarkers(filteredByService)
    : [];

  // Temporal analytics
  const peakHours = nanniesOrders.length > 0
    ? getPeakHoursAnalysis(nanniesOrders, 10)
    : [];
  const weeklyPatterns = nanniesOrders.length > 0
    ? getWeeklyPatterns(nanniesOrders)
    : [];
  const seasonalTrends = nanniesOrders.length > 0
    ? getSeasonalTrends(nanniesOrders)
    : [];

  // Customer analytics
  const highValueCustomers = nanniesOrders.length > 0
    ? getHighValueCustomers(nanniesOrders, 5)
    : [];

  return {
    orders: nanniesOrders,
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
