"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  data: Array<{ [key: string]: string | number }>;
  categories: Array<{
    name: string;
    color: string;
  }>;
  index: string;
  className?: string;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
}

export function ChartCard({
  title,
  description,
  data,
  categories,
  index,
  className,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
}: ChartCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey={index}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
              />
              <Tooltip
                formatter={(value: number) => [valueFormatter(value), ""]}
              />
              {categories.map((category) => (
                <Line
                  key={category.name}
                  type="monotone"
                  dataKey={category.name}
                  stroke={category.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {showLegend && (
          <div className="mt-4 flex flex-wrap gap-3">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
