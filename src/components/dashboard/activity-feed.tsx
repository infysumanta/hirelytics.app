'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const StatusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  reviewed: 'bg-blue-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
};

function ActivityItem({ title, description, timestamp, status }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      {status && (
        <span
          className={cn('mt-0.5 h-2 w-2 rounded-full', StatusColors[status] || 'bg-gray-500')}
        />
      )}
      <div className="flex-1 space-y-1">
        <p className="font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-sm text-muted-foreground">{timestamp}</div>
    </div>
  );
}

interface ActivityFeedProps {
  title: string;
  description?: string;
  items: Array<ActivityItemProps>;
  className?: string;
  emptyMessage?: string;
}

export function ActivityFeed({
  title,
  items,
  className,
  emptyMessage = 'No recent activity',
}: ActivityFeedProps) {
  return (
    <Card className={cn('col-span-1', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.length > 0 ? (
          items.map((item, i) => <ActivityItem key={i} {...item} />)
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
