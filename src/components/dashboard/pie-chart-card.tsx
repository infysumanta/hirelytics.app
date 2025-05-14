"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PieChartCardProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  className?: string;
}

export function PieChartCard({
  title,
  description,
  data,
  className,
}: PieChartCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="h-[300px] w-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <div className="grid grid-cols-2 gap-2 px-6 pb-6">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex items-center gap-1 text-sm">
              <div>{item.name}:</div>
              <div className="font-semibold">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
