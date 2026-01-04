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

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${config.name}: ${response.statusText}`);
  }

  return response.json();
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

// Fetch all orders from all services (or use mock data)
export async function fetchAllOrders(): Promise<{
  orders: Order[];
  byService: Record<ServiceType, Order[]>;
}> {
  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    // Simulate network delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getCachedMockOrders();
  }

  const results = await Promise.allSettled(
    allServices.map((service) => fetchOrders(service.id))
  );

  const byService: Record<ServiceType, Order[]> = {
    nannies: [],
    "car-seat": [],
    "home-care": [],
  };

  results.forEach((result, index) => {
    const serviceType = allServices[index].id;
    if (result.status === "fulfilled") {
      byService[serviceType] = result.value.data;
    } else {
      console.error(`Failed to fetch ${serviceType} orders:`, result.reason);
    }
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
