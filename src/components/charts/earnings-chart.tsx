"use client";

import { cn, formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { SalesChartData } from "@/lib/types";

// Format today's date for display
function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface EarningsChartProps {
  data: SalesChartData[];
  projections?: { month: string; projected: number; actual?: number }[];
  title?: string;
  className?: string;
}

export function EarningsChart({
  data,
  projections,
  title = "Earning Growth",
  className,
}: EarningsChartProps) {
  // Calculate total
  const total = data.reduce((sum, d) => sum + d.current, 0);

  // Find max for highlight
  const currentMax = Math.max(...data.map((d) => d.current));
  const maxDataPoint = data.find((d) => d.current === currentMax);

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
            {formatCurrency(total, "AED")}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand-primary" />
            <span className="text-text-muted">{getTodayFormatted()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-neutral-300" />
            <span className="text-text-muted">Last Week</span>
          </div>
          {projections && projections.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-brand-accent border border-dashed" />
              <span className="text-text-muted">Projected</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D363C" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#0D363C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d9d9d9" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#d9d9d9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ececf0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#858d9d" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#858d9d" }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0D363C",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#fff", fontSize: "12px", marginBottom: "4px" }}
              itemStyle={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}
              formatter={(value) => [formatCurrency(Number(value) || 0, "AED"), ""]}
            />
            <Area
              type="monotone"
              dataKey="previous"
              stroke="#d9d9d9"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorPrevious)"
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="#0D363C"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCurrent)"
            />
            {projections && projections.length > 0 && (
              <Area
                type="monotone"
                dataKey="projected"
                data={projections}
                stroke="#D4AF37"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={0.3}
                fill="url(#colorProjected)"
              />
            )}
            {maxDataPoint && (
              <ReferenceDot
                x={maxDataPoint.date}
                y={maxDataPoint.current}
                r={6}
                fill="#0D363C"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Loading skeleton
export function EarningsChartSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-4 bg-neutral-100 rounded w-24 mb-2" />
          <div className="h-8 bg-neutral-100 rounded w-32" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 bg-neutral-100 rounded w-16" />
          <div className="h-4 bg-neutral-100 rounded w-16" />
        </div>
      </div>
      <div className="h-64 bg-neutral-50 rounded-lg" />
    </div>
  );
}
