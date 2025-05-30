'use client';

import Cal from '@calcom/embed-react';

import { Card, CardContent } from '@/components/ui/card';

export default function BookDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="w-full mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Book a Demo</h1>
          <p className="text-muted-foreground">
            Schedule a personalized demo session with our team. We&apos;ll walk you through
            Hirelytics&apos;s features and answer any questions you may have.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div style={{ minHeight: '800px' }}>
              <Cal
                calLink="sumanta-kabiraj/hirelytics-demo"
                style={{ width: '100%', height: '100%', minHeight: '800px' }}
                config={{
                  name: 'Hirelytics Demo',
                  hideEventTypeDetails: '0',
                  layout: 'month_view',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
