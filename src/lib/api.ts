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
  MonthlyEarningData,
  Address,
  Location,
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

// Helper function for consistent 7-day period boundaries
function getWeeklyPeriods(): {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
} {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Current period: last 7 days including today
  const currentEnd = new Date(today);
  const currentStart = new Date(today);
  currentStart.setDate(today.getDate() - 6);
  currentStart.setHours(0, 0, 0, 0);

  // Previous period: 7 days before current period
  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  previousEnd.setHours(23, 59, 59, 999);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - 6);
  previousStart.setHours(0, 0, 0, 0);

  return { currentStart, currentEnd, previousStart, previousEnd };
}

// Projection calculation functions
export function calculateRevenueProjection(
  orders: Order[],
  monthsAhead: number = 3
): { month: string; projected: number; actual?: number }[] {
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];

  // STEP 1: Collect exactly 3 months of historical data
  const now = new Date();
  const historicalData: { month: string; actual: number; monthIndex: number }[] = [];

  // Get data for exactly the last 3 complete months
  for (let i = 2; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setMonth(now.getMonth() - i);

    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd &&
             confirmedStatuses.includes(getPaymentStatus(order));
    });

    const actualRevenue = monthOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    historicalData.push({
      month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      actual: actualRevenue,
      monthIndex: i
    });
  }

  // STEP 2: Validate we have sufficient data (at least 1 month with revenue)
  const validHistoricalData = historicalData.filter(d => d.actual > 0);
  if (validHistoricalData.length < 1) {
    // Return empty projections if no data
    return [];
  }

  // STEP 3: Calculate weighted average (more recent months have higher weight)
  const weights = [1, 2, 3]; // Oldest to newest
  let weightedSum = 0;
  let totalWeight = 0;

  historicalData.forEach((data, index) => {
    if (data.actual > 0) {
      weightedSum += data.actual * weights[index];
      totalWeight += weights[index];
    }
  });

  const averageMonthlyRevenue = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // STEP 4: Generate projection array with proper typing
  const projections: { month: string; projected: number; actual?: number }[] = [];

  // Add historical months with actual data
  historicalData.forEach(historical => {
    projections.push({
      month: historical.month,
      actual: historical.actual,
      projected: historical.actual // Historical projected equals actual
    });
  });

  // Add future months with conservative projections (3 months ahead)
  for (let i = 1; i <= monthsAhead; i++) {
    const futureDate = new Date(now);
    futureDate.setMonth(now.getMonth() + i);

    // Conservative approach: use weighted average with slight growth
    // Allow 1% monthly growth
    const monthlyGrowth = 0.01;
    const projectedRevenue = averageMonthlyRevenue * (1 + (monthlyGrowth * i));

    // Bounds: 0.85x to 1.15x of average for reasonable variance
    const maxBound = averageMonthlyRevenue * 1.15;
    const minBound = averageMonthlyRevenue * 0.85;
    const finalProjected = Math.min(maxBound, Math.max(minBound, projectedRevenue));

    projections.push({
      month: futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      projected: finalProjected
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

// Fetch gear refresh orders from dedicated endpoint
export async function fetchGearRefreshOrders(
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

  return fetchFromStrapi<Order>("gear-refresh", params);
}

// Fetch all orders from all services
export async function fetchAllOrders(): Promise<{
  orders: Order[];
  byService: Record<ServiceType, Order[]>;
}> {
  console.log("🚀 fetchAllOrders called");

  // Fetch from all service endpoints in parallel
  const [nanniesResponse, homeCareResponse, gearRefreshResponse] = await Promise.allSettled([
    fetchOrders("nannies"), // Fetch nannies orders
    fetchHomeCareOrders(), // Fetch home care orders from dedicated endpoint
    fetchGearRefreshOrders(), // Fetch gear refresh orders from dedicated endpoint
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

  // Process gear refresh orders response
  if (gearRefreshResponse.status === "fulfilled") {
    const ordersData = gearRefreshResponse.value.data;
    console.log(`📋 Processing ${ordersData.length} gear refresh orders`);
    ordersData.forEach((strapiOrder: any, index: number) => {
      if (index < 3) { // Log first 3 orders for debugging
        console.log(`Gear Refresh Order ${index + 1} raw data:`, strapiOrder);
      }
      const order = transformStrapiOrder(strapiOrder);
      if (index < 3) {
        console.log(`Gear Refresh Order ${index + 1} transformed:`, order);
      }

      // All orders from gear refresh endpoint go to gear-refresh
      byService["gear-refresh"].push(order);
    });
  } else {
    console.error("Failed to fetch gear refresh orders:", gearRefreshResponse.reason);
  }

  console.log(`📊 Service breakdown:`, {
        nannies: byService.nannies.length,
        "gear-refresh": byService["gear-refresh"].length,
        "home-care": byService["home-care"].length,
      });

  // Filter out cancelled orders from all data
  const filteredByService: Record<ServiceType, Order[]> = {
    nannies: byService.nannies.filter(order => getRequestStatus(order) !== "cancelled"),
    "gear-refresh": byService["gear-refresh"].filter(order => getRequestStatus(order) !== "cancelled"),
    "home-care": byService["home-care"].filter(order => getRequestStatus(order) !== "cancelled"),
  };

  const orders = Object.values(filteredByService).flat();

  return { orders, byService: filteredByService };
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
// Automatically compares current month vs previous month
export function calculateDashboardStats(
  orders: Order[],
  _previousOrders: Order[] = [], // Deprecated - now calculated internally
  serviceType: ServiceType = "nannies"
): DashboardStats {
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];
  const now = new Date();

  // Get current month boundaries
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Get previous month boundaries
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Filter orders by month, excluding cancelled orders
  const currentMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= currentMonthStart && orderDate <= currentMonthEnd && getRequestStatus(order) !== "cancelled";
  });

  const previousMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= previousMonthStart && orderDate <= previousMonthEnd && getRequestStatus(order) !== "cancelled";
  });

  // Filter confirmed orders
  const currentConfirmed = currentMonthOrders.filter(o => confirmedStatuses.includes(getPaymentStatus(o)));
  const previousConfirmed = previousMonthOrders.filter(o => confirmedStatuses.includes(getPaymentStatus(o)));

  // Calculate revenues
  const totalRevenue = currentConfirmed.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const previousRevenue = previousConfirmed.reduce((sum, order) => sum + getOrderTotal(order), 0);

  // Calculate total profit based on service-specific margins
  const totalProfit = currentConfirmed.reduce((sum, order) => {
    return sum + calculateOrderProfit(order, serviceType);
  }, 0);

  // Calculate total cost based on service-specific margins
  const totalCost = currentConfirmed.reduce((sum, order) => {
    return sum + calculateOrderCost(order, serviceType);
  }, 0);

  // Calculate previous profit for comparison
  const previousProfit = previousConfirmed.reduce((sum, order) => {
    return sum + calculateOrderProfit(order, serviceType);
  }, 0);

  const completedOrders = currentMonthOrders.filter(o => getRequestStatus(o) === "completed").length;
  const pendingOrders = currentMonthOrders.filter(o => getRequestStatus(o) === "pending").length;

  // Calculate average order value change
  const currentAOV = currentConfirmed.length > 0 ? totalRevenue / currentConfirmed.length : 0;
  const previousAOV = previousConfirmed.length > 0 ? previousRevenue / previousConfirmed.length : 0;
  const averageOrderValueChange = getPercentageChange(currentAOV, previousAOV);

  return {
    totalRevenue,
    totalProfit,
    totalCost,
    totalOrders: currentMonthOrders.length,
    completedOrders,
    pendingOrders,
    cancelledOrders: 0, // No longer tracking cancelled orders
    revenueChange: getPercentageChange(totalRevenue, previousRevenue),
    profitChange: previousConfirmed.length > 0
      ? getPercentageChange(totalProfit, previousProfit)
      : 0,
    ordersChange: getPercentageChange(currentMonthOrders.length, previousMonthOrders.length),
    averageOrderValueChange,
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

// Generate sales chart data (last 7 days vs previous 7 days)
export function generateSalesChartData(orders: Order[]): SalesChartData[] {
  console.log(`📊 generateSalesChartData called with ${orders.length} orders`);

  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];
  const data: SalesChartData[] = [];
  const { currentStart } = getWeeklyPeriods();

  // Log sample orders for debugging
  if (orders.length > 0) {
    console.log("📊 Sample order for chart data:", {
      id: orders[0].id,
      createdAt: orders[0].createdAt,
      paymentStatus: getPaymentStatus(orders[0]),
      total: getOrderTotal(orders[0])
    });
  }

  // Generate data for each of the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentStart);
    date.setDate(currentStart.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Current period - orders for this day
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

    // Calculate daily totals
    const currentTotal = dayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    const previousTotal = previousDayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      current: currentTotal,
      previous: previousTotal,
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

    orders
      .filter(order => getRequestStatus(order) !== "cancelled")
      .forEach(order => {
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

// Geographic Analytics Functions
export interface CityStats {
  city: string;
  country: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface GeographicMarker {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  orderCount: number;
  totalRevenue: number;
  serviceType: ServiceType;
}

export function getTopCitiesByOrders(
  byService: Record<ServiceType, Order[]>,
  limit: number = 10
): CityStats[] {
  const cityStats = new Map<string, CityStats>();

  Object.entries(byService).forEach(([serviceType, orders]) => {
    const confirmedOrders = orders.filter(o =>
      ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"].includes(getPaymentStatus(o)) &&
      getRequestStatus(o) !== "cancelled"
    );

    confirmedOrders.forEach(order => {
      const location = getOrderLocation(order);
      if (location.city && location.country) {
        const key = `${location.city}-${location.country}`;
        const revenue = getOrderTotal(order);

        const existing = cityStats.get(key) || {
          city: location.city,
          country: location.country,
          orderCount: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
        };

        existing.orderCount += 1;
        existing.totalRevenue += revenue;
        existing.averageOrderValue = existing.totalRevenue / existing.orderCount;

        cityStats.set(key, existing);
      }
    });
  });

  return Array.from(cityStats.values())
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, limit);
}

export function getTopCitiesByRevenue(
  byService: Record<ServiceType, Order[]>,
  limit: number = 10
): CityStats[] {
  const cityStats = new Map<string, CityStats>();

  Object.entries(byService).forEach(([serviceType, orders]) => {
    const confirmedOrders = orders.filter(o =>
      ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"].includes(getPaymentStatus(o)) &&
      getRequestStatus(o) !== "cancelled"
    );

    confirmedOrders.forEach(order => {
      const location = getOrderLocation(order);
      if (location.city && location.country) {
        const key = `${location.city}-${location.country}`;
        const revenue = getOrderTotal(order);

        const existing = cityStats.get(key) || {
          city: location.city,
          country: location.country,
          orderCount: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
        };

        existing.orderCount += 1;
        existing.totalRevenue += revenue;
        existing.averageOrderValue = existing.totalRevenue / existing.orderCount;

        cityStats.set(key, existing);
      }
    });
  });

  return Array.from(cityStats.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

export function getGeographicMarkers(
  byService: Record<ServiceType, Order[]>
): GeographicMarker[] {
  const markers: GeographicMarker[] = [];

  Object.entries(byService).forEach(([serviceType, orders]) => {
    const confirmedOrders = orders.filter(o =>
      ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"].includes(getPaymentStatus(o)) &&
      getRequestStatus(o) !== "cancelled"
    );

    // Group orders by location
    const locationGroups = new Map<string, Order[]>();

    confirmedOrders.forEach(order => {
      const location = getOrderLocation(order);
      if (location.lat && location.lng && location.city && location.country) {
        const key = `${location.lat}-${location.lng}-${location.city}-${location.country}`;
        if (!locationGroups.has(key)) {
          locationGroups.set(key, []);
        }
        locationGroups.get(key)!.push(order);
      }
    });

    // Create markers from grouped locations
    locationGroups.forEach((orders, key) => {
      const location = getOrderLocation(orders[0]);
      const totalRevenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);

      markers.push({
        id: key,
        lat: location.lat!,
        lng: location.lng!,
        city: location.city!,
        country: location.country!,
        orderCount: orders.length,
        totalRevenue,
        serviceType: serviceType as ServiceType,
      });
    });
  });

  return markers;
}

// Temporal Analytics Functions
export interface PeakHourData {
  hour: number;
  orderCount: number;
  totalRevenue: number;
  displayHour: string;
}

export interface WeeklyPatternData {
  day: string;
  dayIndex: number;
  orderCount: number;
  totalRevenue: number;
}

export interface SeasonalData {
  month: string;
  monthIndex: number;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export function getPeakHoursAnalysis(
  orders: Order[],
  limit: number = 24
): PeakHourData[] {
  const hourStats = new Map<number, { count: number; revenue: number }>();

  const confirmedOrders = orders.filter(o =>
    ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"].includes(getPaymentStatus(o)) &&
    getRequestStatus(o) !== "cancelled"
  );

  confirmedOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const hour = orderDate.getHours();

    const existing = hourStats.get(hour) || { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += getOrderTotal(order);
    hourStats.set(hour, existing);
  });

  return Array.from(hourStats.entries())
    .map(([hour, stats]) => ({
      hour,
      orderCount: stats.count,
      totalRevenue: stats.revenue,
      displayHour: `${hour.toString().padStart(2, '0')}:00`,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, limit);
}

export function getWeeklyPatterns(orders: Order[]): WeeklyPatternData[] {
  const dayStats = new Map<number, { count: number; revenue: number; dayName: string }>();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const confirmedOrders = orders.filter(o =>
    ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"].includes(getPaymentStatus(o)) &&
    getRequestStatus(o) !== "cancelled"
  );

  confirmedOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const dayIndex = orderDate.getDay();

    const existing = dayStats.get(dayIndex) || {
      count: 0,
      revenue: 0,
      dayName: dayNames[dayIndex]
    };
    existing.count += 1;
    existing.revenue += getOrderTotal(order);
    dayStats.set(dayIndex, existing);
  });

  return Array.from(dayStats.entries())
    .map(([dayIndex, stats]) => ({
      day: stats.dayName,
      dayIndex,
      orderCount: stats.count,
      totalRevenue: stats.revenue,
    }))
    .sort((a, b) => a.dayIndex - b.dayIndex); // Sort by day of week
}

export function getSeasonalTrends(orders: Order[]): SeasonalData[] {
  const monthStats = new Map<number, { count: number; revenue: number }>();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const confirmedOrders = orders.filter(o =>
    ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"].includes(getPaymentStatus(o)) &&
    getRequestStatus(o) !== "cancelled"
  );

  confirmedOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const monthIndex = orderDate.getMonth();

    const existing = monthStats.get(monthIndex) || { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += getOrderTotal(order);
    monthStats.set(monthIndex, existing);
  });

  return Array.from(monthStats.entries())
    .map(([monthIndex, stats]) => ({
      month: monthNames[monthIndex],
      monthIndex,
      orderCount: stats.count,
      totalRevenue: stats.revenue,
      averageOrderValue: stats.count > 0 ? stats.revenue / stats.count : 0,
    }))
    .sort((a, b) => a.monthIndex - b.monthIndex); // Sort by month
}

// Customer Insights Functions
export interface HighValueCustomer {
  id: string;
  name: string;
  email?: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

export function getHighValueCustomers(
  orders: Order[],
  limit: number = 10
): HighValueCustomer[] {
  const customerStats = new Map<string, {
    id: string;
    name: string;
    email?: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: string;
  }>();

  const confirmedOrders = orders.filter(o =>
    ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"].includes(getPaymentStatus(o)) &&
    getRequestStatus(o) !== "cancelled"
  );

  confirmedOrders.forEach(order => {
    const customerId = getCustomerId(order);
    const customerName = getCustomerName(order);
    const customerEmail = getCustomerEmail(order);
    const orderTotal = getOrderTotal(order);
    const orderDate = order.createdAt;

    if (customerId && customerName) {
      const existing = customerStats.get(customerId) || {
        id: customerId,
        name: customerName,
        email: customerEmail,
        totalSpent: 0,
        orderCount: 0,
        lastOrderDate: orderDate,
      };

      existing.totalSpent += orderTotal;
      existing.orderCount += 1;

      // Update last order date if this is more recent
      if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = orderDate;
      }

      customerStats.set(customerId, existing);
    }
  });

  return Array.from(customerStats.values())
    .map(customer => ({
      ...customer,
      averageOrderValue: customer.totalSpent / customer.orderCount,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

// Helper functions for customer data
function getCustomerId(order: Order): string | undefined {
  // For home care orders, use email as customer identifier
  if ("email" in order && order.email) {
    return order.email;
  }
  // For other orders with customer object, use customer email
  if ("customer" in order && order.customer?.email) {
    return order.customer.email;
  }
  // Fallback to order ID for unique identification
  if ("documentId" in order) {
    return order.documentId;
  }
  return undefined;
}

function getCustomerEmail(order: Order): string | undefined {
  if ("customer" in order && order.customer?.email) {
    return order.customer.email;
  }
  if ("email" in order) {
    return order.email;
  }
  return undefined;
}

// Helper function to get order location (handles different order types)
function getOrderLocation(order: Order): {
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
} {
  // Check for home care address
  if ("address" in order && order.address) {
    const addr = order.address as Address;
    return {
      city: addr.city,
      country: addr.country,
    };
  }

  // Check for location object
  if ("location" in order && order.location) {
    const loc = order.location;
    return {
      city: loc.city,
      country: loc.country,
      lat: loc.lat,
      lng: loc.lng,
    };
  }

  return {};
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

// Infer product name from order based on service type
function inferProductName(order: Order, serviceType: ServiceType): string {
  const data = order as any;

  switch (serviceType) {
    case "nannies": {
      // Use type field: day, week, month
      const type = data.type || "day";
      const typeNames: Record<string, string> = {
        day: "Daily Nanny",
        week: "Weekly Nanny",
        month: "Monthly Nanny",
      };
      return typeNames[type] || "Nanny Service";
    }
    case "gear-refresh": {
      // Use price to infer product tier
      const price = data.price || data.total || 0;
      return `Car Seat Installation (AED ${price})`;
    }
    case "home-care": {
      // Use property_type + no_of_rooms
      const propertyType = data.property_type || "Property";
      const rooms = data.no_of_rooms || 0;
      const propName = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
      return `${propName} - ${rooms} Room${rooms !== 1 ? "s" : ""}`;
    }
    default:
      return "Unknown Product";
  }
}

// Get top selling products by aggregating orders and inferring product types
export function getTopProducts(
  byService: Record<ServiceType, Order[]>,
  limit: number = 5
): TopService[] {
  const productStats = new Map<string, {
    orders: number;
    revenue: number;
    service: ServiceType;
    currency: string;
    productName: string;
  }>();

  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];

   Object.entries(byService).forEach(([serviceType, orders]) => {
     const confirmedOrders = orders.filter(o =>
       confirmedStatuses.includes(getPaymentStatus(o)) &&
       getRequestStatus(o) !== "cancelled"
     );

     confirmedOrders.forEach(order => {
      const productName = inferProductName(order, serviceType as ServiceType);
      const key = `${serviceType}:${productName}`;

      const existing = productStats.get(key) || {
        orders: 0,
        revenue: 0,
        service: serviceType as ServiceType,
        currency: order.currencyCode || "AED",
        productName,
      };

      existing.orders += 1;
      existing.revenue += getOrderTotal(order);
      productStats.set(key, existing);
    });
  });

  return Array.from(productStats.entries())
    .map(([key, stats]) => ({
      id: key,
      name: stats.productName,
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

// Format date with ordinal suffix for earnings chart (e.g., "Mon 18th Jan")
function formatEarningDate(date: Date): string {
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st"
    : day === 2 || day === 22 ? "nd"
    : day === 3 || day === 23 ? "rd"
    : "th";

  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });

  return `${weekday} ${day}${suffix} ${month}`;
}

// Generate weekly earning data (last 7 days vs previous 7 days - aligned with generateSalesChartData)
export function generateEarningData(orders: Order[]): SalesChartData[] {
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];
  const data: SalesChartData[] = [];
  const { currentStart } = getWeeklyPeriods();

  // Generate data for each of the last 7 days (same period as generateSalesChartData)
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentStart);
    date.setDate(currentStart.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Current period - orders for this day
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
      date: formatEarningDate(date),
      current: dayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0),
      previous: previousDayOrders.reduce((sum, o) => sum + getOrderTotal(o), 0),
    });
  }

  return data;
}

// Helper function to get week boundaries within a month
function getWeekBoundaries(year: number, month: number, weekNum: number): { start: Date; end: Date } {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Calculate week start (each week is ~7 days)
  const weekStart = new Date(year, month, 1 + (weekNum - 1) * 7);
  const weekEnd = new Date(year, month, Math.min(weekNum * 7, lastDay.getDate()));

  // Clamp to month boundaries
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);

  return {
    start: weekStart > lastDay ? lastDay : weekStart,
    end: weekEnd > lastDay ? lastDay : weekEnd,
  };
}

// Helper to get revenue for a specific week of a month
function getWeekRevenue(
  orders: Order[],
  baseDate: Date,
  weekNum: number,
  monthsAgo: number
): number {
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];

  const targetDate = new Date(baseDate);
  targetDate.setMonth(targetDate.getMonth() - monthsAgo);

  const { start, end } = getWeekBoundaries(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    weekNum
  );

  const weekOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= start &&
           orderDate <= end &&
           confirmedStatuses.includes(getPaymentStatus(order));
  });

  return weekOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
}

// Generate monthly earning data (3-month comparison by weeks)
export function generateMonthlyEarningData(orders: Order[]): MonthlyEarningData[] {
  const now = new Date();
  const data: MonthlyEarningData[] = [];

  // Generate data for 4 weeks
  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const currentMonthRevenue = getWeekRevenue(orders, now, weekNum, 0);
    const oneMonthAgoRevenue = getWeekRevenue(orders, now, weekNum, 1);
    const twoMonthsAgoRevenue = getWeekRevenue(orders, now, weekNum, 2);

    data.push({
      week: `Week ${weekNum}`,
      currentMonth: currentMonthRevenue,
      oneMonthAgo: oneMonthAgoRevenue,
      twoMonthsAgo: twoMonthsAgoRevenue,
    });
  }

  return data;
}
