import { NannyOrder, CarSeatOrder, HomeCareOrder, ServiceType, Order } from "./types";

// Helper to generate random date within last 30 days
function randomDate(daysBack: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

// Helper to generate random ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Payment statuses with weighted probability
const paymentStatuses = [
  { status: "Payment confirmed" as const, weight: 40 },
  { status: "Completed" as const, weight: 25 },
  { status: "Pending payment" as const, weight: 15 },
  { status: "Sent to vendor" as const, weight: 10 },
  { status: "Cancelled" as const, weight: 5 },
  { status: "Refunded" as const, weight: 3 },
  { status: "Payment failed" as const, weight: 2 },
];

function getRandomPaymentStatus() {
  const totalWeight = paymentStatuses.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { status, weight } of paymentStatuses) {
    random -= weight;
    if (random <= 0) return status;
  }
  return "Payment confirmed";
}

// Request statuses with weighted probability
const requestStatuses = [
  { status: "completed" as const, weight: 50 },
  { status: "pending" as const, weight: 35 },
  { status: "cancelled" as const, weight: 15 },
];

function getRandomRequestStatus() {
  const totalWeight = requestStatuses.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { status, weight } of requestStatuses) {
    random -= weight;
    if (random <= 0) return status;
  }
  return "pending";
}

// Customer names
const customerNames = [
  "Andrea Ovaline",
  "Stevany Chamberlain",
  "Luminoire Grant",
  "Marcus Williams",
  "Sarah Johnson",
  "Michael Chen",
  "Emma Thompson",
  "David Rodriguez",
  "Sofia Martinez",
  "James Wilson",
  "Olivia Brown",
  "Ethan Davis",
  "Ava Miller",
  "Noah Garcia",
  "Isabella Anderson",
];

// Generate mock nanny orders
export function generateMockNannyOrders(count: number = 50): NannyOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const price = Math.floor(Math.random() * 500) + 100;
    const hasDiscount = Math.random() > 0.7;
    const discountAmount = hasDiscount ? Math.floor(price * 0.1) : 0;
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

    return {
      id: i + 1,
      documentId: `nanny-${generateId()}`,
      orderId: `NAN-${String(1000 + i).padStart(6, "0")}`,
      customer: {
        id: i + 1,
        fullName: customerName,
        email: customerName.toLowerCase().replace(" ", ".") + "@email.com",
        phone: `+971 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
      },
      location: {
        id: i + 1,
        address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        city: Math.random() > 0.5 ? "Dubai" : "Abu Dhabi",
        country: "UAE",
      },
      hours: Math.floor(Math.random() * 8) + 2,
      type: ["day", "week", "month"][Math.floor(Math.random() * 3)] as any,
      noOfDays: Math.floor(Math.random() * 7) + 1,
      date: randomDate(30).split("T")[0],
      time: `${String(Math.floor(Math.random() * 12) + 7).padStart(2, "0")}:00`,
      noOfChildren: Math.floor(Math.random() * 3) + 1,
      price,
      total: price - discountAmount,
      originalPrice: price,
      discountedPrice: hasDiscount ? price - discountAmount : undefined,
      couponCode: hasDiscount ? "SAVE10" : undefined,
      paymentStatus: getRandomPaymentStatus(),
      paymentId: `pay_${generateId()}`,
      responseId: `resp_${generateId()}`,
      currencyCode: Math.random() > 0.3 ? "AED" : "SAR",
      smsConfirmationSent: Math.random() > 0.2,
      requestStatus: getRandomRequestStatus(),
      locales: Math.random() > 0.3 ? "en" : "ar",
      createdAt: randomDate(30),
      updatedAt: randomDate(10),
      package: {
        id: Math.floor(Math.random() * 5) + 1,
        name: ["Basic Care", "Premium Care", "Full Day", "Weekly Package", "Monthly Package"][
          Math.floor(Math.random() * 5)
        ],
        price,
      },
    };
  });
}

// Generate mock car seat orders
export function generateMockCarSeatOrders(count: number = 30): CarSeatOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const price = Math.floor(Math.random() * 300) + 50;
    const hasDiscount = Math.random() > 0.8;
    const discountAmount = hasDiscount ? Math.floor(price * 0.15) : 0;
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

    return {
      id: i + 1,
      documentId: `carseat-${generateId()}`,
      orderId: `CAR-${String(2000 + i).padStart(6, "0")}`,
      customer: {
        id: i + 1,
        fullName: customerName,
        email: customerName.toLowerCase().replace(" ", ".") + "@email.com",
        phone: `+971 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
      },
      location: {
        id: i + 1,
        address: `${Math.floor(Math.random() * 999) + 1} Palm Avenue`,
        city: Math.random() > 0.5 ? "Dubai" : "Sharjah",
        country: "UAE",
      },
      price,
      total: price - discountAmount,
      originalPrice: price,
      discountedPrice: hasDiscount ? price - discountAmount : undefined,
      couponCode: hasDiscount ? "CAR15" : undefined,
      paymentStatus: getRandomPaymentStatus(),
      paymentId: `pay_${generateId()}`,
      responseId: `resp_${generateId()}`,
      currencyCode: Math.random() > 0.3 ? "AED" : "SAR",
      smsConfirmationSent: Math.random() > 0.2,
      requestStatus: getRandomRequestStatus(),
      locales: Math.random() > 0.3 ? "en" : "ar",
      createdAt: randomDate(30),
      updatedAt: randomDate(10),
      package: {
        id: Math.floor(Math.random() * 3) + 1,
        name: ["Basic Install", "Premium Install", "Safety Check"][Math.floor(Math.random() * 3)],
        price,
      },
    };
  });
}

// Generate mock home care orders
export function generateMockHomeCareOrders(count: number = 40): HomeCareOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const price = Math.floor(Math.random() * 400) + 150;
    const hasDiscount = Math.random() > 0.75;
    const discountAmount = hasDiscount ? Math.floor(price * 0.12) : 0;
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

    return {
      id: i + 1,
      documentId: `homecare-${generateId()}`,
      orderId: `HOME-${String(3000 + i).padStart(6, "0")}`,
      fullName: customerName,
      email: customerName.toLowerCase().replace(" ", ".") + "@email.com",
      phone: `+971 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
      address: {
        id: i + 1,
        street: `${Math.floor(Math.random() * 999) + 1} Residence Blvd`,
        city: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"][Math.floor(Math.random() * 4)],
        state: "UAE",
        country: "UAE",
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
      },
      special_instructions: Math.random() > 0.7 ? "Please call before arriving" : undefined,
      date: randomDate(30).split("T")[0],
      time: `${String(Math.floor(Math.random() * 10) + 8).padStart(2, "0")}:00`,
      duration: Math.floor(Math.random() * 4) + 2,
      property_type: Math.random() > 0.5 ? "apartment" : "house",
      supplies_needed: Math.random() > 0.6,
      price,
      originalPrice: price,
      discountedPrice: hasDiscount ? price - discountAmount : undefined,
      couponCode: hasDiscount ? "CLEAN12" : undefined,
      payment_status: getRandomPaymentStatus(),
      payment_id: `pay_${generateId()}`,
      response_id: `resp_${generateId()}`,
      currencyCode: Math.random() > 0.3 ? "AED" : "SAR",
      smsConfirmationSent: Math.random() > 0.2,
      request_status: getRandomRequestStatus(),
      no_of_rooms: Math.floor(Math.random() * 5) + 1,
      language_code: Math.random() > 0.3 ? "en" : "ar",
      countryCode: "AE",
      createdAt: randomDate(30),
      updatedAt: randomDate(10),
      // Add base fields to satisfy interface
      paymentStatus: getRandomPaymentStatus(),
      requestStatus: getRandomRequestStatus(),
      total: price - discountAmount,
      service_package: {
        id: Math.floor(Math.random() * 4) + 1,
        name: ["Deep Clean", "Standard Clean", "Move-out Clean", "Weekly Clean"][
          Math.floor(Math.random() * 4)
        ],
        price,
      },
    };
  });
}

// Get all mock orders
export function getMockOrders(): {
  orders: Order[];
  byService: Record<ServiceType, Order[]>;
} {
  const nannyOrders = generateMockNannyOrders(50);
  const carSeatOrders = generateMockCarSeatOrders(30);
  const homeCareOrders = generateMockHomeCareOrders(40);

  return {
    orders: [...nannyOrders, ...carSeatOrders, ...homeCareOrders],
    byService: {
      nannies: nannyOrders,
      "car-seat": carSeatOrders,
      "home-care": homeCareOrders,
    },
  };
}

// Cache for consistent mock data during session
let cachedMockData: ReturnType<typeof getMockOrders> | null = null;

export function getCachedMockOrders(): ReturnType<typeof getMockOrders> {
  if (!cachedMockData) {
    cachedMockData = getMockOrders();
  }
  return cachedMockData;
}

// Reset cache (useful for testing)
export function resetMockDataCache(): void {
  cachedMockData = null;
}
