"use client";

import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Transaction, PaymentStatus } from "@/lib/types";
import { ArrowUpRight, Baby, Car, Home } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
  className?: string;
}

const statusStyles: Record<PaymentStatus, { bg: string; text: string }> = {
  "Pending payment": { bg: "bg-warning-100", text: "text-warning-600" },
  "Payment failed": { bg: "bg-red-50", text: "text-brand-error" },
  "Payment confirmed": { bg: "bg-success-50", text: "text-success-600" },
  Rescheduled: { bg: "bg-blue-50", text: "text-blue-600" },
  "Sent to vendor": { bg: "bg-purple-50", text: "text-purple-600" },
  Cancelled: { bg: "bg-neutral-100", text: "text-neutral-600" },
  "QC/Feedback": { bg: "bg-orange-50", text: "text-orange-600" },
  Completed: { bg: "bg-success-50", text: "text-success-600" },
  Refunded: { bg: "bg-red-50", text: "text-red-600" },
};

// Shorter display labels for status badges
const statusLabels: Partial<Record<PaymentStatus, string>> = {
  "Payment confirmed": "Paid",
  "Pending payment": "Pending",
  "Payment failed": "Failed",
  "Sent to vendor": "Processing",
  "QC/Feedback": "QC",
};


const serviceIcons: Record<string, React.ReactNode> = {
  nannies: <Baby className="size-4" />,
  "gear-refresh": <Car className="size-4" />,
  "home-care": <Home className="size-4" />,
};

export function RecentTransactions({
  transactions,
  className,
}: RecentTransactionsProps) {
  return (
    <div
      className={cn("bg-white border border-neutral-200 rounded-xl", className)}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <h3 className="font-semibold text-text-primary">Recent Transaction</h3>
        <button className="text-sm text-brand-primary hover:underline flex items-center gap-1">
          See All Transaction
        </button>
      </div>

      <div className="divide-y divide-neutral-100">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 px-6 py-3 text-xs font-medium text-text-muted">
          <span>Name</span>
          <span>Status</span>
          <span>Amount</span>
          <span className="text-right">Service</span>
        </div>

        {/* Table Body */}
        {transactions.map((transaction) => {
          const statusStyle = statusStyles[transaction.status] || {
            bg: "bg-neutral-100",
            text: "text-neutral-600",
          };

          return (
            <div
              key={transaction.id}
              className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-medium">
                  {transaction.customerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {transaction.customerName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    statusStyle.bg,
                    statusStyle.text
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {statusLabels[transaction.status] || transaction.status}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center">
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>

              {/* Service Icon */}
              <div className="flex items-center justify-end">
                <div
                  className="size-8 rounded-lg bg-neutral-100 flex items-center justify-center text-text-secondary"
                  title={transaction.serviceName}
                >
                  {serviceIcons[transaction.service]}
                </div>
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-text-muted">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
export function RecentTransactionsSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl animate-pulse">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div className="h-5 bg-neutral-100 rounded w-40" />
        <div className="h-4 bg-neutral-100 rounded w-32" />
      </div>
      <div className="divide-y divide-neutral-100">
        <div className="grid grid-cols-4 gap-4 px-6 py-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 bg-neutral-100 rounded w-16" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="grid grid-cols-4 gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-neutral-100" />
              <div>
                <div className="h-4 bg-neutral-100 rounded w-24 mb-1" />
                <div className="h-3 bg-neutral-100 rounded w-16" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-6 bg-neutral-100 rounded-full w-16" />
            </div>
            <div className="flex items-center">
              <div className="h-4 bg-neutral-100 rounded w-20" />
            </div>
            <div className="flex items-center justify-end">
              <div className="size-8 bg-neutral-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
