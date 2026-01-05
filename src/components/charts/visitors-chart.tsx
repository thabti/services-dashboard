"use client";

import { useMemo } from "react";
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

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#0D363C] border-none rounded-lg p-3 shadow-lg">
      <p className="text-white text-xs mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: payload[0]?.payload?.color || "#0D363C" }}
        />
        <span className="text-white text-sm font-medium">
          {formatNumber(payload[0]?.value || 0)} Orders
        </span>
      </div>
    </div>
  );
}

interface VisitorsChartProps {
  data: { service: string; orders: number; color: string }[];
  title?: string;
  className?: string;
}

export function VisitorsChart({
  data,
  title = "Orders by Service",
  className,
}: VisitorsChartProps) {
  // Handle empty data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { service: "Nannies", orders: 0, color: "#0D363C" },
        { service: "Car Seat", orders: 0, color: "#2D5A47" },
        { service: "Home Care", orders: 0, color: "#6B8E23" },
      ];
    }
    return data;
  }, [data]);

  // Calculate total
  const total = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (d.orders || 0), 0);
  }, [chartData]);

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
        <div className="flex items-center gap-3 text-xs">
          {chartData.map((item) => (
            <div key={item.service} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-text-muted">{item.service}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ececf0"
              vertical={false}
            />
            <XAxis
              dataKey="service"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#858d9d" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#858d9d" }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(13, 54, 60, 0.05)" }} />
            <Bar
              dataKey="orders"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.85}
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
