"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface ClickableStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  className?: string;
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function ClickableStatCard({
  title,
  value,
  description,
  icon,
  className,
  href,
  trend,
}: ClickableStatCardProps) {
  const cardContent = (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      href && "hover:shadow-md hover:border-primary/30 cursor-pointer",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
          {href && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div
            className={cn(
              "mt-1 flex items-center text-xs font-medium",
              trend.isPositive ? "text-green-500" : "text-red-500",
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
