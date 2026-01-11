"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CityStats } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface TopAreasChartProps {
  data: CityStats[];
  type: "orders" | "revenue";
  title: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function TopAreasChart({ data, type, title }: TopAreasChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    name: item.city,
    value: type === "orders" ? item.orderCount : item.totalRevenue,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              fontSize={12}
              tickFormatter={type === "revenue" ? (value) => `$${value}` : undefined}
            />
            <Tooltip
              formatter={(value: number | undefined) => [
                type === "revenue" ? formatCurrency(value || 0) : value || 0,
                type === "orders" ? "Orders" : "Revenue"
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface GeographicDistributionProps {
  data: CityStats[];
  title: string;
}

export function GeographicDistribution({ data, title }: GeographicDistributionProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    name: item.city,
    value: item.orderCount,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) => [value || 0, "Orders"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}