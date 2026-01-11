// Payment Status (common across all services)
export type PaymentStatus =
  | "Pending payment"
  | "Payment failed"
  | "Payment confirmed"
  | "Rescheduled"
  | "Sent to vendor"
  | "Cancelled"
  | "QC/Feedback"
  | "Completed"
  | "Refunded";

// Request Status
export type RequestStatus = "pending" | "cancelled" | "completed" | "scheduled";

// Currency
export type CurrencyCode = "AED" | "SAR";

// Locale
export type Locale = "en" | "ar";

// Booking type for nannies
export type BookingType = "day" | "week" | "month";

// Property type for home care
export type PropertyType = "house" | "apartment";

// Customer Component
export interface Customer {
  id?: number;
  fullName?: string;
  email?: string;
  phone?: string;
}

// Location Component
export interface Location {
  id?: number;
  address?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

// Address Component (for home care)
export interface Address {
  id?: number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

// Service Package
export interface ServicePackage {
  id: number;
  name: string;
  price?: number;
}

// Base Order fields (common across all services)
export interface BaseOrder {
  id: number;
  documentId: string;
  orderId: string;
  price: number;
  total?: number;
  originalPrice?: number;
  discountedPrice?: number;
  couponCode?: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  responseId?: string;
  currencyCode: CurrencyCode;
  smsConfirmationSent?: boolean;
  requestStatus: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

// Nannies Order
export interface NannyOrder extends BaseOrder {
  customer?: Customer;
  location?: Location;
  hours?: number;
  type?: BookingType;
  noOfDays?: number;
  date?: string;
  time?: string;
  noOfChildren?: number;
  locales?: Locale;
  specialInstructions?: string;
  package?: ServicePackage;
}

// Car Seat Order
export interface CarSeatOrder extends BaseOrder {
  customer?: Customer;
  location?: Location;
  locales?: Locale;
  package?: ServicePackage;
}

// Home Care Order
export interface HomeCareOrder extends BaseOrder {
  fullName: string;
  email: string;
  phone: string;
  address?: Address;
  special_instructions?: string;
  date?: string;
  time?: string;
  duration?: number;
  property_type?: PropertyType;
  supplies_needed?: boolean;
  service_package?: ServicePackage;
  no_of_rooms?: number;
  language_code?: string;
  countryCode?: string;
  payment_status: PaymentStatus;
  request_status: RequestStatus;
  payment_id?: string;
  response_id?: string;
}

// Service type
export type ServiceType = "nannies" | "gear-refresh" | "home-care";

// Generic order union type
export type Order = NannyOrder | CarSeatOrder | HomeCareOrder;

// Strapi API Response (matches actual Strapi format)
export interface StrapiResponse<T> {
  data: Array<{
    id: number;
    documentId: string;
    attributes: T;
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Service Configuration
export interface ServiceConfig {
  id: ServiceType;
  name: string;
  apiUrl: string;
  endpoint: string;
  authToken: string;
  color: string;
  icon: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  revenueChange: number;
  profitChange: number;
  ordersChange: number;
  averageOrderValueChange: number;
}

// Chart Data
export interface SalesChartData {
  date: string;
  current: number;
  previous: number;
}

// Monthly Earning Data (3-month comparison by weeks)
export interface MonthlyEarningData {
  week: string;           // "Week 1", "Week 2", "Week 3", "Week 4"
  currentMonth: number;   // Revenue for current month
  oneMonthAgo: number;    // Revenue for 1 month ago
  twoMonthsAgo: number;   // Revenue for 2 months ago
}

export interface ServiceBreakdown {
  service: string;
  value: number;
  color: string;
}

// Transaction for recent transactions table
export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  service: ServiceType;
  serviceName: string;
  amount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  date: string;
}

// Top Service/Package
export interface TopService {
  id: string;
  name: string;
  service: ServiceType;
  orders: number;
  revenue: number;
  currency: CurrencyCode;
  status: "available" | "low_stock" | "out_of_stock";
}
