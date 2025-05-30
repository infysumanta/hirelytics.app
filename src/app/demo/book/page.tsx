'use client';

import Cal from '@calcom/embed-react';

export default function BookDemoPage() {
  return (
    <div className="container mx-auto py-9">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Book a Demo</h1>
        <p className="text-muted-foreground text-lg">
          Schedule a personalized demo session with our team. We&apos;ll walk you through
          Hirelytics&apos;s features and answer any questions you may have.
        </p>
      </div>
      <Cal
        calLink="sumanta-kabiraj/hirelytics-demo"
        style={{ width: '100%', height: '800px' }}
        config={{
          name: 'Hirelytics Demo',
          hideEventTypeDetails: '0',
          layout: 'month_view',
        }}
      />
    </div>
  );
}
