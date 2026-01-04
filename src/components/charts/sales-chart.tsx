"use client";

import { cn, formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
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

interface SalesChartProps {
  data: SalesChartData[];
  projections?: { month: string; projected: number; actual?: number }[];
  title?: string;
  className?: string;
}

export function SalesChart({
  data,
  projections,
  title = "Total Sales",
  className,
}: SalesChartProps) {
  // Find the max value to highlight
  const currentMax = Math.max(...data.map((d) => d.current));
  const maxDataPoint = data.find((d) => d.current === currentMax);

  // Calculate total
  const total = data.reduce((sum, d) => sum + d.current, 0);

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
             <span className="text-text-muted">Last Month</span>
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
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#d9d9d9"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: "#d9d9d9" }}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#0D363C"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#0D363C" }}
            />
            {projections && projections.length > 0 && (
              <Line
                type="monotone"
                dataKey="projected"
                data={projections}
                stroke="#D4AF37"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: "#D4AF37" }}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Loading skeleton
export function SalesChartSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-4 bg-neutral-100 rounded w-20 mb-2" />
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
