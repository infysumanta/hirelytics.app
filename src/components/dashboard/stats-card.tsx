"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
  trend,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "mr-1",
                  trend.isPositive ? "text-green-500" : "text-red-500",
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}%
              </span>
            )}
            <span>{description || trend?.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
