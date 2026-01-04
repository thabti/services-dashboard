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
import { getServiceConfig, allServices, USE_MOCK_DATA } from "./config";
import { getPercentageChange } from "./utils";
import { getCachedMockOrders } from "./mock-data";

// Generic fetch function with auth headers
async function fetchFromStrapi<T>(
  serviceType: ServiceType,
  params?: Record<string, string>
): Promise<StrapiResponse<T>> {
  const config = getServiceConfig(serviceType);

  const url = new URL(`${config.apiUrl}${config.endpoint}`);
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
    "pagination[pageSize]": String(options?.pageSize || 100),
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
    "pagination[pageSize]": String(options?.pageSize || 100),
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

// Coupon redemption interface
interface CouponRedemption {
  coupon: any;
  orderId: string;
  phoneNumber: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  redemptionDate: string;
  createdBy: any;
  updatedBy: any;
}

// Fetch coupon redemptions
export async function fetchCouponRedemptions(
  options?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, string>;
  }
): Promise<StrapiResponse<CouponRedemption>> {
  const serviceType = "nannies" as ServiceType; // Use nannies config for API access
  const config = getServiceConfig(serviceType);

  const url = new URL(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/strapi/coupon-redemptions`);
  if (options) {
    if (options.page) url.searchParams.append("pagination[page]", String(options.page));
    if (options.pageSize) url.searchParams.append("pagination[pageSize]", String(options.pageSize || 100));
    if (options.sort) url.searchParams.append("sort", options.sort || "createdAt:desc");

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        url.searchParams.append(`filters[${key}]`, value);
      });
    }
  }

  url.searchParams.append("populate", "*");

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error for coupon redemptions:`, errorText);
    throw new Error(`Failed to fetch coupon redemptions: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Fetch coupon redemptions
export async function fetchCouponRedemptions(
  options?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, string>;
  }
): Promise<StrapiResponse<CouponRedemption>> {
  const serviceType = "nannies" as ServiceType; // Use nannies config for API access
  const config = getServiceConfig(serviceType);

  const url = new URL(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/strapi/coupon-redemptions`);
  if (options) {
    if (options.page) url.searchParams.append("pagination[page]", String(options.page));
    if (options.pageSize) url.searchParams.append("pagination[pageSize]", String(options.pageSize || 100));
    if (options.sort) url.searchParams.append("sort", options.sort || "createdAt:desc");

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        url.searchParams.append(`filters[${key}]`, value);
      });
    }
  }

  url.searchParams.append("populate", "*");

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error for coupon redemptions:`, errorText);
    throw new Error(`Failed to fetch coupon redemptions: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
  }

  url.searchParams.append("populate", "*");

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch coupon redemptions: ${response.statusText}`);
  }

  return response.json();
}

// Transform Strapi order to app Order format
function transformStrapiOrder(strapiOrder: { id: number; documentId: string; attributes: any }): Order {
  const { id, documentId, attributes } = strapiOrder;

  // Handle different field name variations
  const paymentStatus = attributes.payment_status || attributes.paymentStatus || "Pending payment";
  const requestStatus = attributes.request_status || attributes.requestStatus || "pending";
  const total = attributes.total || attributes.price || 0;

  // Base order structure
  const order: any = {
    id,
    documentId,
    orderId: attributes.orderId || `ORDER-${id}`,
    price: attributes.price || total,
    total,
    originalPrice: attributes.originalPrice || attributes.price || total,
    paymentStatus,
    paymentId: attributes.payment_id || attributes.paymentId,
    responseId: attributes.response_id || attributes.responseId,
    currencyCode: attributes.currencyCode || attributes.currency_code || "AED",
    smsConfirmationSent: attributes.smsConfirmationSent || attributes.sms_confirmation_sent || false,
    requestStatus,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  };

  // Add service-specific fields
  if (attributes.customer) {
    order.customer = {
      id: attributes.customer.data?.id,
      fullName: attributes.customer.data?.attributes?.fullName || attributes.customer.data?.attributes?.full_name,
      email: attributes.customer.data?.attributes?.email,
      phone: attributes.customer.data?.attributes?.phone,
    };
  }

  if (attributes.location) {
    order.location = {
      id: attributes.location.data?.id,
      address: attributes.location.data?.attributes?.address,
      city: attributes.location.data?.attributes?.city,
      country: attributes.location.data?.attributes?.country,
    };
  }

  // Service-specific fields for nannies
  if (attributes.hours !== undefined) order.hours = attributes.hours;
  if (attributes.type) order.type = attributes.type;
  if (attributes.noOfDays !== undefined) order.noOfDays = attributes.noOfDays;
  if (attributes.date) order.date = attributes.date;
  if (attributes.time) order.time = attributes.time;
  if (attributes.noOfChildren !== undefined) order.noOfChildren = attributes.noOfChildren;
  if (attributes.locales) order.locales = attributes.locales;

  // Service-specific fields for home care
  if (attributes.fullName) order.fullName = attributes.fullName;
  if (attributes.address) order.address = attributes.address;
  if (attributes.duration !== undefined) order.duration = attributes.duration;
  if (attributes.property_type) order.property_type = attributes.property_type;
  if (attributes.supplies_needed !== undefined) order.supplies_needed = attributes.supplies_needed;
  if (attributes.no_of_rooms !== undefined) order.no_of_rooms = attributes.no_of_rooms;
  if (attributes.language_code) order.language_code = attributes.language_code;
  if (attributes.countryCode) order.countryCode = attributes.countryCode;

  return order as Order;
}

// Fetch all orders from all services (or use mock data)
export async function fetchAllOrders(): Promise<{
  orders: Order[];
  byService: Record<ServiceType, Order[]>;
}> {
  console.log("🚀 fetchAllOrders called, USE_MOCK_DATA:", USE_MOCK_DATA);

  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    console.log("📦 Using mock data");
    // Simulate network delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getCachedMockOrders();
  }

  console.log("🌐 Fetching real data from Strapi");

  try {
    // Since all data appears to be in /api/orders, fetch once and categorize
    const [ordersResponse, couponsResponse] = await Promise.allSettled([
      fetchOrders("nannies"), // Fetch all orders from the main endpoint
      fetchCouponRedemptions(),
    ]);

    const byService: Record<ServiceType, Order[]> = {
      nannies: [],
      "car-seat": [],
      "home-care": [],
    };

    // Process orders response (all services)
    if (ordersResponse.status === "fulfilled") {
      const ordersData = ordersResponse.value.data;
      console.log(`📋 Processing ${ordersData.length} orders`);
      ordersData.forEach((strapiOrder, index) => {
        if (index < 2) { // Log first 2 orders
          console.log(`Order ${index + 1} raw data:`, strapiOrder);
        }
        const order = transformStrapiOrder(strapiOrder);
        console.log(`Order ${index + 1} transformed:`, order);
        // For now, categorize all as nannies since we don't have a service type field
        // You might need to add logic to determine service type based on order content
        byService.nannies.push(order);
      });
    } else {
      console.error("Failed to fetch orders:", ordersResponse.reason);
    }

    // Process coupons and link to orders
    let couponsMap: Map<string, any> = new Map();
    if (couponsResponse.status === "fulfilled") {
      const couponsData = couponsResponse.value.data;
      couponsData.forEach((coupon) => {
        const { attributes } = coupon;
        couponsMap.set(attributes.orderId, {
          coupon: attributes.coupon,
          discountType: attributes.discountType,
          discountValue: attributes.discountValue,
          couponCode: attributes.coupon?.data?.attributes?.code,
        });
      });
    }

    // Apply coupons to orders
    Object.values(byService).flat().forEach((order) => {
      const couponData = couponsMap.get(order.orderId);
      if (couponData) {
        const { discountType, discountValue, couponCode } = couponData;
        const originalPrice = order.originalPrice || order.price || order.total || 0;

        let discountAmount = 0;
        if (discountType === "percentage") {
          discountAmount = (originalPrice * discountValue) / 100;
        } else if (discountType === "fixed") {
          discountAmount = discountValue;
        }

        order.discountedPrice = originalPrice - discountAmount;
        order.couponCode = couponCode;
        // Update total to reflect discount
        if (order.total) {
          order.total = order.discountedPrice;
        }
      }
    });

    const orders = Object.values(byService).flat();

    return { orders, byService };
  } catch (error) {
    console.error("Failed to fetch data from Strapi:", error);
    // Fallback to mock data on error
    return getCachedMockOrders();
  }
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

  const completedOrders = orders.filter(o => getRequestStatus(o) === "completed").length;
  const pendingOrders = orders.filter(o => getRequestStatus(o) === "pending").length;
  const cancelledOrders = orders.filter(o => getRequestStatus(o) === "cancelled").length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    revenueChange: getPercentageChange(totalRevenue, previousRevenue),
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
  const confirmedStatuses = ["Payment confirmed", "Completed", "Sent to vendor", "QC/Feedback"];
  const data: SalesChartData[] = [];
  const today = new Date();

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
