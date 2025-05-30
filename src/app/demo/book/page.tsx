'use client';

import Cal from '@calcom/embed-react';

export default function BookDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/30 dark:bg-blue-500/30 blur-[120px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/30 dark:bg-purple-500/30 blur-[120px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/30 dark:bg-indigo-500/30 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="h-full w-full bg-[url('/patterns/grid.svg')] bg-repeat opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 pt-8 relative z-10">
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
    </div>
  );
}
