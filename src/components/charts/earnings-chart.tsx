"use client";

import { useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SalesChartData } from "@/lib/types";

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
  // Merge main data with projections if available
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // If no data, show empty chart with days of the week
      const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
      return days.map((day) => ({
        date: day,
        current: 0,
        previous: 0,
      }));
    }

    // If projections exist, merge them with actual data
    if (projections && projections.length > 0) {
      return data.map((d, index) => ({
        ...d,
        projected: projections[index]?.projected || null,
      }));
    }

    return data;
  }, [data, projections]);

  // Calculate total
  const total = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (d.current || 0), 0);
  }, [chartData]);

  // Format Y-axis tick to show with K suffix
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
            <span className="w-3 h-0.5 bg-brand-primary rounded" />
            <span className="text-text-muted">This Week</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-neutral-300 rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-text-muted">Last Week</span>
          </div>
          {projections && projections.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 rounded" />
              <span className="text-text-muted">Projected</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="earningsGradientCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D363C" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0D363C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="earningsGradientPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="earningsGradientProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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

            {/* Previous period area (dashed line with light fill) */}
            <Area
              type="monotone"
              dataKey="previous"
              name="Last Week"
              stroke="#d1d5db"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#earningsGradientPrevious)"
              connectNulls
            />

            {/* Current period area (solid line with gradient fill) */}
            <Area
              type="monotone"
              dataKey="current"
              name="This Week"
              stroke="#0D363C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#earningsGradientCurrent)"
              dot={{ r: 3, fill: "#0D363C", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#0D363C", strokeWidth: 2, stroke: "#fff" }}
              connectNulls
            />

            {/* Projected area if available */}
            {projections && projections.length > 0 && (
              <Area
                type="monotone"
                dataKey="projected"
                name="Projected"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3 3"
                fillOpacity={1}
                fill="url(#earningsGradientProjected)"
                connectNulls
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
