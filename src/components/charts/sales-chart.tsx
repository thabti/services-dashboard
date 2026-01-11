"use client";

import { useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#0D363C] border-none rounded-lg p-3 shadow-lg">
      <p className="text-white text-xs mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white text-sm font-medium">
            {formatCurrency(entry.value || 0, "AED")}
          </span>
        </div>
      ))}
    </div>
  );
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
  // Merge main data with projections if available
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // If no data, show empty chart with zero values
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          current: 0,
          previous: 0,
        };
      });
    }

    // Calculate daily average and create projected trend line
    const avgDaily = data.reduce((sum, d) => sum + d.current, 0) / data.length;

    // Add projected field to each data point based on trend
    return data.map((d, index) => ({
      ...d,
      projected: avgDaily > 0 ? avgDaily * (1 + (index * 0.02)) : 0,
    }));
  }, [data, projections]);

  // Calculate total
  const total = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (d.current || 0), 0);
  }, [chartData]);

  // Format Y-axis tick to show AED with K suffix
  const formatYAxis = (value: number) => {
    if (value === 0) return "0";
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  // Calculate Y-axis domain
  const yAxisDomain = useMemo(() => {
    const allValues = chartData.flatMap(d => [
      d.current || 0,
      d.previous || 0,
      (d as any).projected || 0,
    ]);
    const maxVal = Math.max(...allValues, 0);
    return [0, Math.ceil(maxVal * 1.1) || 1000];
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
            {formatCurrency(total, "AED")}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 rounded" />
            <span className="text-text-muted">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-neutral-300 rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-text-muted">Previous</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 rounded" />
            <span className="text-text-muted">Projected</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ececf0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#858d9d" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#858d9d" }}
              tickFormatter={formatYAxis}
              width={45}
              domain={yAxisDomain}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Previous period line (dashed) */}
            <Line
              type="monotone"
              dataKey="previous"
              name="Previous"
              stroke="#d1d5db"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: "#d1d5db", strokeWidth: 0 }}
              connectNulls
            />

            {/* Current period line (solid) */}
            <Line
              type="monotone"
              dataKey="current"
              name="Current"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
              connectNulls
            />

            {/* Projected trend line */}
            <Line
              type="monotone"
              dataKey="projected"
              name="Projected"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
              connectNulls
            />
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
