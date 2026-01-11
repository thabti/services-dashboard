"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { PeakHourData, WeeklyPatternData, SeasonalData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface PeakHoursChartProps {
  data: PeakHourData[];
  title: string;
}

export function PeakHoursChart({ data, title }: PeakHoursChartProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="displayHour"
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip
              formatter={(value: number | undefined) => [value || 0, "Orders"]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Bar dataKey="orderCount" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface WeeklyPatternsChartProps {
  data: WeeklyPatternData[];
  title: string;
}

export function WeeklyPatternsChart({ data, title }: WeeklyPatternsChartProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              fontSize={12}
            />
            <YAxis
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number | undefined) => [formatCurrency(value || 0), "Revenue"]}
              labelFormatter={(label) => `Day: ${label}`}
            />
            <Bar dataKey="totalRevenue" fill="#82CA9D" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface SeasonalTrendsChartProps {
  data: SeasonalData[];
  title: string;
}

export function SeasonalTrendsChart({ data, title }: SeasonalTrendsChartProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              fontSize={12}
            />
            <YAxis
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined) => [
                name === "totalRevenue" ? formatCurrency(value || 0) : value || 0,
                name === "totalRevenue" ? "Revenue" : "Orders"
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              stroke="#8884d8"
              strokeWidth={2}
              name="totalRevenue"
            />
            <Line
              type="monotone"
              dataKey="orderCount"
              stroke="#82ca9d"
              strokeWidth={2}
              name="orderCount"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}