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
import { MonthlyEarningData } from "@/lib/types";

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
  data: MonthlyEarningData[];
  title?: string;
  className?: string;
}

export function EarningsChart({
  data,
  title = "Earning Growth",
  className,
}: EarningsChartProps) {
  // Process data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // If no data, show empty chart with weeks
      return [
        { week: "Week 1", currentMonth: 0, oneMonthAgo: 0, twoMonthsAgo: 0 },
        { week: "Week 2", currentMonth: 0, oneMonthAgo: 0, twoMonthsAgo: 0 },
        { week: "Week 3", currentMonth: 0, oneMonthAgo: 0, twoMonthsAgo: 0 },
        { week: "Week 4", currentMonth: 0, oneMonthAgo: 0, twoMonthsAgo: 0 },
      ];
    }

    return data;
  }, [data]);

  // Calculate total for current month
  const total = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (d.currentMonth || 0), 0);
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
      d.currentMonth || 0,
      d.oneMonthAgo || 0,
      d.twoMonthsAgo || 0,
    ]);
    const maxVal = Math.max(...allValues, 0);
    return [0, Math.ceil(maxVal * 1.1) || 1000];
  }, [chartData]);

  // Get month labels
  const getMonthLabel = (monthsAgo: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return date.toLocaleDateString("en-US", { month: "short" });
  };

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
            <span className="text-text-muted">{getMonthLabel(0)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-gray-400 rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-text-muted">{getMonthLabel(1)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-purple-400 rounded" />
            <span className="text-text-muted">{getMonthLabel(2)}</span>
          </div>
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
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="earningsGradientOneMonth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="earningsGradientTwoMonths" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ececf0"
              vertical={false}
            />
            <XAxis
              dataKey="week"
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

            {/* 2 Months Ago (purple, dotted) */}
            <Area
              type="monotone"
              dataKey="twoMonthsAgo"
              name={getMonthLabel(2)}
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="2 2"
              fillOpacity={1}
              fill="url(#earningsGradientTwoMonths)"
              connectNulls
            />

            {/* 1 Month Ago (gray, dashed) */}
            <Area
              type="monotone"
              dataKey="oneMonthAgo"
              name={getMonthLabel(1)}
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#earningsGradientOneMonth)"
              connectNulls
            />

            {/* Current Month (blue, solid) */}
            <Area
              type="monotone"
              dataKey="currentMonth"
              name={getMonthLabel(0)}
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#earningsGradientCurrent)"
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
              connectNulls
            />
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
          <div className="h-4 bg-neutral-100 rounded w-16" />
        </div>
      </div>
      <div className="h-64 bg-neutral-50 rounded-lg" />
    </div>
  );
}
