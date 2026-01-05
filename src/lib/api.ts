import {
  ServiceType,
  StrapiResponse,
  NannyOrder,
  CarSeatOrder,
  HomeCareOrder,
  Order,
  DashboardStats,
  Transaction,
  TopService,
  SalesChartData,
  ServiceBreakdown,
  PaymentStatus,
} from "./types";
import { getServiceConfig, allServices } from "./config";
import { getPercentageChange } from "./utils";

// Generic fetch function with auth headers
async function fetchFromStrapi<T>(
  serviceType: ServiceType,
  params?: Record<string, string>
): Promise<StrapiResponse<T>> {
  const config = getServiceConfig(serviceType);

  // Use window.location.origin as base when apiUrl is empty (client-side proxy)
  const baseUrl = config.apiUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const url = new URL(`${baseUrl}${config.endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  console.log(`🔍 Fetching from Strapi: ${url.toString()}`);
  console.log(`Service: ${serviceType}, Has token: ${!!config.authToken}`);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.authToken}`,
      },
      cache: "no-store",
    });

    console.log(`📡 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error for ${serviceType}:`, errorText);
      throw new Error(`Failed to fetch from ${config.name}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data?.data?.length || 0} items for ${serviceType}`);
    console.log('Sample data:', data?.data?.[0]);

    return data;
  } catch (error) {
    console.error(`💥 Fetch error for ${serviceType}:`, error);
    throw error;
  }
}

// Fetch orders for a specific service
export async function fetchOrders(
  serviceType: ServiceType,
  options?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, string>;
  }
): Promise<StrapiResponse<Order>> {
  const params: Record<string, string> = {
    "pagination[page]": String(options?.page || 1),
    "pagination[pageSize]": String(options?.pageSize || 1000), // Increased for better analytics
    sort: options?.sort || "createdAt:desc",
  };

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      params[`filters[${key}]`] = value;
    });
  }

  // Add populate for relations
  params["populate"] = "*";

  return fetchFromStrapi<Order>(serviceType, params);
}

// Fetch service requests for home care
export async function fetchServiceRequests(
  options?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, string>;
  }
): Promise<StrapiResponse<Order>> {
  const serviceType = "home-care" as ServiceType;
  const params: Record<string, string> = {
    "pagination[page]": String(options?.page || 1),
    "pagination[pageSize]": String(options?.pageSize || 1000),
    sort: options?.sort || "createdAt:desc",
  };

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      params[`filters[${key}]`] = value;
    });
  }

  // Add populate for relations
  params["populate"] = "*";

  return fetchFromStrapi<Order>(serviceType, params);
}

// Projection calculation functions
export function calculateRevenueProjection(
  orders: Order[],
  monthsAhead: number = 6
): { month: string; projected: number; actual?: number }[] {
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];

  // Get last 6 months of actual data
  const now = new Date();
  const projections = [];

  for (let i = monthsAhead - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setMonth(now.getMonth() - i);

    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    // Calculate actual revenue for this month
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd &&
             confirmedStatuses.includes(getPaymentStatus(order));
    });

    const actualRevenue = monthOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    projections.push({
      month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      actual: actualRevenue,
      projected: actualRevenue // For now, use actual; will be enhanced with linear regression
    });
  }

  // Apply linear regression for future projections
  const validData = projections.filter(p => p.actual && p.actual > 0);
  if (validData.length >= 3) {
    // Simple linear regression
    const n = validData.length;
    const sumX = validData.reduce((sum, _, i) => sum + i, 0);
    const sumY = validData.reduce((sum, p) => sum + p.actual!, 0);
    const sumXY = validData.reduce((sum, p, i) => sum + i * p.actual!, 0);
    const sumXX = validData.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Apply projections for future months
    projections.forEach((p, index) => {
      if (!p.actual || p.actual === 0) {
        p.projected = Math.max(0, slope * index + intercept);
      } else {
        p.projected = p.actual;
      }
    });
  }

  return projections;
}

export function calculateServiceGrowthProjection(
  byService: Record<ServiceType, Order[]>,
  monthsAhead: number = 6
): Record<ServiceType, { month: string; projected: number; actual?: number }[]> {
  const result: Record<ServiceType, { month: string; projected: number; actual?: number }[]> = {
    nannies: [],
    "gear-refresh": [],
    "home-care": []
  };

  Object.entries(byService).forEach(([serviceType, orders]) => {
    const projections = calculateRevenueProjection(orders, monthsAhead);
    // Convert revenue projections to order count projections
    result[serviceType as ServiceType] = projections.map(p => ({
      ...p,
      projected: p.projected / 300, // Rough estimate: AED 300 per order
      actual: p.actual ? p.actual / 300 : undefined
    }));
  });

  return result;
}

// Transform Strapi order to app Order format
// Supports both Strapi v4 (with attributes) and v5 (flat structure)
function transformStrapiOrder(strapiOrder: any): Order {
  console.log("🔄 Transforming order:", strapiOrder.id, "has attributes:", !!strapiOrder.attributes);

  const { id, documentId } = strapiOrder;

  // Strapi v5 uses flat structure, v4 uses nested attributes
  // If attributes exists and has data, use it; otherwise use the flat structure
  const data = strapiOrder.attributes && Object.keys(strapiOrder.attributes).length > 0
    ? strapiOrder.attributes
    : strapiOrder;

  console.log("📋 Data keys available:", Object.keys(data));

  // Handle different field name variations
  const paymentStatus = data.payment_status || data.paymentStatus || "Pending payment";
  const requestStatus = data.request_status || data.requestStatus || "pending";
  const total = data.total || data.price || 0;

  // Base order structure
  const order: any = {
    id,
    documentId,
    orderId: data.orderId || `ORDER-${id}`,
    price: data.price || total,
    total,
    originalPrice: data.originalPrice || data.price || total,
    paymentStatus,
    paymentId: data.payment_id || data.paymentId,
    responseId: data.response_id || data.responseId,
    currencyCode: data.currencyCode || data.currency_code || "AED",
    smsConfirmationSent: data.smsConfirmationSent || data.sms_confirmation_sent || false,
    requestStatus,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  // Add service-specific fields - handle both v4 nested and v5 flat customer structure
  if (data.customer) {
    // Strapi v5 flat structure
    if (data.customer.fullName || data.customer.email) {
      order.customer = {
        id: data.customer.id,
        fullName: data.customer.fullName || data.customer.full_name,
        email: data.customer.email,
        phone: data.customer.phone,
      };
    }
    // Strapi v4 nested structure
    else if (data.customer.data) {
      order.customer = {
        id: data.customer.data?.id,
        fullName: data.customer.data?.attributes?.fullName || data.customer.data?.attributes?.full_name,
        email: data.customer.data?.attributes?.email,
        phone: data.customer.data?.attributes?.phone,
      };
    }
  }

  // Handle location - both v4 nested and v5 flat structure
  if (data.location) {
    // Strapi v5 flat structure
    if (data.location.address || data.location.city) {
      order.location = {
        id: data.location.id,
        address: data.location.address,
        city: data.location.city,
        country: data.location.country,
      };
    }
    // Strapi v4 nested structure
    else if (data.location.data) {
      order.location = {
        id: data.location.data?.id,
        address: data.location.data?.attributes?.address,
        city: data.location.data?.attributes?.city,
        country: data.location.data?.attributes?.country,
      };
    }
  }

  // Service-specific fields for nannies
  if (data.hours !== undefined) order.hours = data.hours;
  if (data.type) order.type = data.type;
  if (data.noOfDays !== undefined) order.noOfDays = data.noOfDays;
  if (data.date) order.date = data.date;
  if (data.time) order.time = data.time;
  if (data.noOfChildren !== undefined) order.noOfChildren = data.noOfChildren;
  if (data.locales) order.locales = data.locales;

  // Service-specific fields for home care (inline customer data, not a relation)
  if (data.fullName) order.fullName = data.fullName;
  if (data.email) order.email = data.email;
  if (data.phone) order.phone = data.phone;
  if (data.address) order.address = data.address;
  if (data.special_instructions) order.special_instructions = data.special_instructions;
  if (data.duration !== undefined) order.duration = data.duration;
  if (data.property_type) order.property_type = data.property_type;
  if (data.supplies_needed !== undefined) order.supplies_needed = data.supplies_needed;
  if (data.no_of_rooms !== undefined) order.no_of_rooms = data.no_of_rooms;
  if (data.language_code) order.language_code = data.language_code;
  if (data.countryCode) order.countryCode = data.countryCode;

  // Also store snake_case versions for home care compatibility
  if (data.payment_status) order.payment_status = data.payment_status;
  if (data.request_status) order.request_status = data.request_status;

  return order as Order;
}

// Detect service type based on order attributes
function detectServiceType(order: Order): ServiceType {
  const data = order as any;

  console.log("🔍 Detecting service type for order:", order.orderId, "data keys:", Object.keys(data));

  // Check for nanny-specific fields (multiple possible field names)
  if (data.hours !== undefined || data.noOfChildren !== undefined ||
      data.numberOfHours || data.children || data.numberOfChildren ||
      data.childAgeGroups || data.no_of_children ||
      data.type === "day" || data.type === "week" || data.type === "month" ||
      data.bookingType === "nanny" || data.serviceType === "nanny") {
    console.log("👶 Detected as nannies service");
    return "nannies";
  }

  // Check for home care specific fields
  if (data.property_type || data.supplies_needed !== undefined ||
      data.no_of_rooms !== undefined || data.duration !== undefined ||
      data.fullName || data.address?.street || data.cleaningType) {
    console.log("🏠 Detected as home-care service");
    return "home-care";
  }

  // Check for gear refresh specific fields
  if (data.carType || data.installationType || data.serviceType === "gear-refresh") {
    console.log("🔧 Detected as gear-refresh service");
    return "gear-refresh";
  }

  // For the nannies page, default to nannies service
  console.log("🤔 No specific indicators found, defaulting to nannies");
  return "nannies"; // Default fallback for nannies page
}

// Fetch home care orders from dedicated endpoint
export async function fetchHomeCareOrders(
  options?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, string>;
  }
): Promise<StrapiResponse<Order>> {
  const params: Record<string, string> = {
    "pagination[page]": String(options?.page || 1),
    "pagination[pageSize]": String(options?.pageSize || 1000),
    sort: options?.sort || "createdAt:desc",
  };

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      params[`filters[${key}]`] = value;
    });
  }

  // Add populate for relations
  params["populate"] = "*";

  return fetchFromStrapi<Order>("home-care", params);
}

// Fetch all orders from all services
export async function fetchAllOrders(): Promise<{
  orders: Order[];
  byService: Record<ServiceType, Order[]>;
}> {
  console.log("🚀 fetchAllOrders called");

  // Fetch from both nannies and home care endpoints in parallel
  const [nanniesResponse, homeCareResponse] = await Promise.allSettled([
    fetchOrders("nannies"), // Fetch nannies orders
    fetchHomeCareOrders(), // Fetch home care orders from dedicated endpoint
  ]);

  const byService: Record<ServiceType, Order[]> = {
    nannies: [],
    "gear-refresh": [],
    "home-care": [],
  };

  // Process nannies orders response
  if (nanniesResponse.status === "fulfilled") {
    const ordersData = nanniesResponse.value.data;
    console.log(`📋 Processing ${ordersData.length} nannies orders`);
    ordersData.forEach((strapiOrder: any, index: number) => {
      if (index < 3) { // Log first 3 orders for debugging
        console.log(`Nannies Order ${index + 1} raw data:`, strapiOrder);
      }
      const order = transformStrapiOrder(strapiOrder);
      if (index < 3) {
        console.log(`Nannies Order ${index + 1} transformed:`, order);
      }

      // Detect service type and categorize accordingly
      const serviceType = detectServiceType(order);
      byService[serviceType].push(order);
    });
  } else {
    console.error("Failed to fetch nannies orders:", nanniesResponse.reason);
  }

  // Process home care orders response
  if (homeCareResponse.status === "fulfilled") {
    const ordersData = homeCareResponse.value.data;
    console.log(`📋 Processing ${ordersData.length} home care orders`);
    ordersData.forEach((strapiOrder: any, index: number) => {
      if (index < 3) { // Log first 3 orders for debugging
        console.log(`Home Care Order ${index + 1} raw data:`, strapiOrder);
      }
      const order = transformStrapiOrder(strapiOrder);
      if (index < 3) {
        console.log(`Home Care Order ${index + 1} transformed:`, order);
      }

      // All orders from home care endpoint go to home-care
      byService["home-care"].push(order);
    });
  } else {
    console.error("Failed to fetch home care orders:", homeCareResponse.reason);
  }

      console.log(`📊 Service breakdown:`, {
        nannies: byService.nannies.length,
        "gear-refresh": byService["gear-refresh"].length,
        "home-care": byService["home-care"].length,
      });

  const orders = Object.values(byService).flat();

  return { orders, byService };
}

// Helper to get total from order (handles different field names)
function getOrderTotal(order: Order): number {
  if ("total" in order && order.total) return order.total;
  if ("price" in order) return order.price || 0;
  return 0;
}

// Helper to get payment status (handles different field names)
function getPaymentStatus(order: Order): string {
  if ("paymentStatus" in order) return order.paymentStatus;
  if ("payment_status" in order) return (order as HomeCareOrder).payment_status;
  return "Pending payment";
}

// Helper to get request status (handles different field names)
function getRequestStatus(order: Order): string {
  if ("requestStatus" in order) return order.requestStatus;
  if ("request_status" in order) return (order as HomeCareOrder).request_status;
  return "pending";
}

// Helper to get customer name from order
function getCustomerName(order: Order): string {
  if ("fullName" in order && order.fullName) return order.fullName;
  if ("customer" in order && order.customer?.fullName) return order.customer.fullName;
  return "Unknown Customer";
}

// Service margin rates (percentage of revenue that goes to service provider)
// For a margin business, these represent the cost to the business for each service type
// Profit = Revenue - (Service Provider Cost + Platform Fees + Fixed Costs)
//
// Example for Nannies (35% profit margin):
// - Customer pays AED 100
// - Nanny receives AED 65 (65% margin rate)
// - Platform fee: AED 5 (5% of revenue)
// - Fixed costs: AED 5 per order
// - Total cost: AED 75
// - Profit: AED 25 (25% of revenue)
const SERVICE_MARGIN_RATES: Record<ServiceType, number> = {
  nannies: 0.65,    // 65% goes to nanny, 35% profit margin
  "gear-refresh": 0.70, // 70% goes to technician, 30% profit margin
  "home-care": 0.60, // 60% goes to cleaner, 40% profit margin
};

// Additional fixed costs per order (platform fees, payment processing, etc.)
const FIXED_COSTS_PER_ORDER = 5; // AED per order
const PLATFORM_FEE_PERCENTAGE = 0.05; // 5% platform fee

/**
 * Profit Calculation for Margin Business
 *
 * Formula: Profit = Revenue - Cost
 * Cost = Service Provider Payment + Platform Fees + Fixed Costs
 *
 * @param revenue - Total amount paid by customer
 * @param serviceType - Type of service (determines margin rate)
 * @returns Profit amount in AED
 *
 * Example: Customer pays AED 100 for nanny service
 * - Service provider (nanny): AED 65 (65% margin)
 * - Platform fee: AED 5 (5% of AED 100)
 * - Fixed costs: AED 5
 * - Total cost: AED 75
 * - Profit: AED 25 (25% profit margin)
 */

// Calculate cost for an order (what the business pays out)
export function calculateOrderCost(order: Order, serviceType: ServiceType): number {
  const revenue = getOrderTotal(order);
  const marginRate = SERVICE_MARGIN_RATES[serviceType] || 0.65;

  // Service provider cost (margin)
  const serviceProviderCost = revenue * marginRate;

  // Platform fee
  const platformFee = revenue * PLATFORM_FEE_PERCENTAGE;

  // Fixed costs
  const fixedCosts = FIXED_COSTS_PER_ORDER;

  return serviceProviderCost + platformFee + fixedCosts;
}

// Calculate profit for an order
export function calculateOrderProfit(order: Order, serviceType: ServiceType): number {
  const revenue = getOrderTotal(order);
  const cost = calculateOrderCost(order, serviceType);
  return revenue - cost;
}

// Calculate dashboard stats from orders
export function calculateDashboardStats(
  orders: Order[],
  previousOrders: Order[] = []
): DashboardStats {
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];

  const currentConfirmed = orders.filter(o => confirmedStatuses.includes(getPaymentStatus(o)));
  const previousConfirmed = previousOrders.filter(o => confirmedStatuses.includes(getPaymentStatus(o)));

  const totalRevenue = currentConfirmed.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const previousRevenue = previousConfirmed.reduce((sum, order) => sum + getOrderTotal(order), 0);

  // Calculate total profit based on service margins
  const totalProfit = currentConfirmed.reduce((sum, order) => {
    // For now, assume all orders are nannies since we don't have service type in the order
    // This should be improved when we have proper service type detection
    return sum + calculateOrderProfit(order, "nannies");
  }, 0);

  // Calculate total cost
  const totalCost = currentConfirmed.reduce((sum, order) => {
    return sum + calculateOrderCost(order, "nannies");
  }, 0);

  const completedOrders = orders.filter(o => getRequestStatus(o) === "completed").length;
  const pendingOrders = orders.filter(o => getRequestStatus(o) === "pending").length;
  const cancelledOrders = orders.filter(o => getRequestStatus(o) === "cancelled").length;

  return {
    totalRevenue,
    totalProfit,
    totalCost,
    totalOrders: orders.length,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    revenueChange: getPercentageChange(totalRevenue, previousRevenue),
    profitChange: previousConfirmed.length > 0
      ? getPercentageChange(totalProfit, previousConfirmed.reduce((sum, order) =>
          sum + calculateOrderProfit(order, "nannies"), 0))
      : 0, // No previous data available
    ordersChange: getPercentageChange(orders.length, previousOrders.length),
  };
}

// Calculate service breakdown
export function calculateServiceBreakdown(
  byService: Record<ServiceType, Order[]>
): ServiceBreakdown[] {
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];

  return allServices.map(service => {
    const serviceOrders = byService[service.id];
    const confirmedOrders = serviceOrders.filter(o =>
      confirmedStatuses.includes(getPaymentStatus(o))
    );
    const revenue = confirmedOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    return {
      service: service.name,
      value: revenue,
      color: service.color,
    };
  });
}

// Generate sales chart data (last 7 days)
export function generateSalesChartData(orders: Order[]): SalesChartData[] {
  console.log(`📊 generateSalesChartData called with ${orders.length} orders`);

  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];
  const data: SalesChartData[] = [];
  const today = new Date();

  // Log sample orders for debugging
  if (orders.length > 0) {
    console.log("📊 Sample order for chart data:", {
      id: orders[0].id,
      createdAt: orders[0].createdAt,
      paymentStatus: getPaymentStatus(orders[0]),
      total: getOrderTotal(orders[0])
    });
  }

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Current period
    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      return orderDate === dateStr && confirmedStatuses.includes(getPaymentStatus(o));
    });

    // Previous period (7 days earlier)
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 7);
    const previousDateStr = previousDate.toISOString().split("T")[0];

    const previousDayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      return orderDate === previousDateStr && confirmedStatuses.includes(getPaymentStatus(o));
    });

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      current: dayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0),
      previous: previousDayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0),
    });
  }

  console.log(`📊 generateSalesChartData returning ${data.length} data points:`, data);
  return data;
}

// Get recent transactions
export function getRecentTransactions(
  byService: Record<ServiceType, Order[]>,
  limit: number = 10
): Transaction[] {
  const transactions: Transaction[] = [];

  Object.entries(byService).forEach(([serviceType, orders]) => {
    const service = getServiceConfig(serviceType as ServiceType);

    orders.forEach(order => {
      transactions.push({
        id: order.documentId,
        orderId: order.orderId,
        customerName: getCustomerName(order),
        service: serviceType as ServiceType,
        serviceName: service.name,
        amount: getOrderTotal(order),
        currency: order.currencyCode || "AED",
        status: getPaymentStatus(order) as any,
        date: order.createdAt,
      });
    });
  });

  // Sort by date descending and limit
  return transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Get top services/packages by revenue
export function getTopServices(
  byService: Record<ServiceType, Order[]>,
  limit: number = 5
): TopService[] {
  const serviceStats = new Map<string, {
    orders: number;
    revenue: number;
    service: ServiceType;
    currency: string;
  }>();

  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];

  Object.entries(byService).forEach(([serviceType, orders]) => {
    const confirmedOrders = orders.filter(o => confirmedStatuses.includes(getPaymentStatus(o)));

    const key = getServiceConfig(serviceType as ServiceType).name;
    const existing = serviceStats.get(key) || {
      orders: 0,
      revenue: 0,
      service: serviceType as ServiceType,
      currency: "AED",
    };

    existing.orders += confirmedOrders.length;
    existing.revenue += confirmedOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    if (confirmedOrders.length > 0) {
      existing.currency = confirmedOrders[0].currencyCode || "AED";
    }

    serviceStats.set(key, existing);
  });

  return Array.from(serviceStats.entries())
    .map(([name, stats]) => ({
      id: stats.service,
      name,
      service: stats.service,
      orders: stats.orders,
      revenue: stats.revenue,
      currency: stats.currency as any,
      status: "available" as const,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// Calculate visitors by service (for bar chart)
export function calculateVisitorsByService(
  byService: Record<ServiceType, Order[]>
): { service: string; orders: number; color: string }[] {
  return allServices.map(service => ({
    service: service.name.split(" ")[0], // Short name
    orders: byService[service.id].length,
    color: service.color,
  }));
}

// Generate weekly earning data
export function generateEarningData(orders: Order[]): SalesChartData[] {
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const data: SalesChartData[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Start from Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Current week
    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      return orderDate === dateStr && confirmedStatuses.includes(getPaymentStatus(o));
    });

    // Previous week
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 7);
    const previousDateStr = previousDate.toISOString().split("T")[0];

    const previousDayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      return orderDate === previousDateStr && confirmedStatuses.includes(getPaymentStatus(o));
    });

    data.push({
      date: days[i],
      current: dayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0),
      previous: previousDayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0),
    });
  }

  return data;
}
