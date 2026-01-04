"use client";

import { cn, formatNumber } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface VisitorsChartProps {
  data: { service: string; orders: number; color: string }[];
  title?: string;
  className?: string;
}

export function VisitorsChart({
  data,
  title = "Total Visitors",
  className,
}: VisitorsChartProps) {
  // Calculate total
  const total = data.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div
      className={cn(
        "bg-white border border-neutral-200 rounded-xl p-6",
        className
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {formatNumber(total)}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand-primary" />
            <span className="text-text-muted">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-neutral-300" />
            <span className="text-text-muted">Last Month</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ececf0"
              vertical={false}
            />
            <XAxis
              dataKey="service"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#858d9d" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#858d9d" }}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(13, 54, 60, 0.05)" }}
              contentStyle={{
                backgroundColor: "#0D363C",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#fff", fontSize: "12px", marginBottom: "4px" }}
              itemStyle={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}
              formatter={(value) => [formatNumber(Number(value) || 0), "Orders"]}
            />
            <Bar dataKey="orders" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Loading skeleton
export function VisitorsChartSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-4 bg-neutral-100 rounded w-24 mb-2" />
          <div className="h-8 bg-neutral-100 rounded w-20" />
        </div>
      </div>
      <div className="h-64 bg-neutral-50 rounded-lg flex items-end justify-around px-4 pb-4 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-neutral-100 rounded-t w-16"
            style={{ height: `${40 + i * 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}
