'use client';

import { Building2, GraduationCap, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Product Demonstrations</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience Hirelytics in action. Watch our demos to see how we revolutionize the hiring
            process for both candidates and recruiters.
          </p>
        </div>

        {/* Book a Demo CTA */}
        <div className="text-center mb-10">
          <Link href="/demo/book">
            <Button
              size="lg"
              variant="default"
              className="gap-3 text-lg font-medium px-8 h-14 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 ease-out"
            >
              <Sparkles className="h-6 w-6" />
              Book a Personalized Demo
            </Button>
          </Link>
        </div>

        {/* Demo Grid */}
        <div className="grid md:grid-cols-2 gap-12 max-w-7p-xl mx-auto">
          {/* Recruiter Demo */}
          <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
            <div className="aspect-video w-full relative">
              <iframe
                src="https://www.youtube.com/embed/OtJV9SCyfuE?modestbranding=1&rel=0&start=180"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Recruiter Demo</h2>
              </div>
              <p className="text-muted-foreground">
                Discover how recruiters can streamline their hiring process, manage applications,
                and leverage AI insights for better decision-making.
              </p>
            </div>
          </div>
          {/* Candidate Demo */}
          <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
            <div className="aspect-video w-full relative">
              <iframe
                src="https://www.youtube.com/embed/OtJV9SCyfuE?modestbranding=1&rel=0&start=180"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Candidate Demo</h2>
              </div>
              <p className="text-muted-foreground">
                See how candidates can effortlessly navigate through our AI-powered interview
                process, submit applications, and track their progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
