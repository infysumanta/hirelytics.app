import { JobsList } from "@/components/jobs/jobs-list";
import { Metadata } from "next";
import { AnimatedBackground } from "@/components/ui/animated-background";

export const metadata: Metadata = {
  title: "Jobs | Hirelytics",
  description: "Find your next opportunity with our extensive job listings",
};

export default function JobsPage() {
  return (
    <AnimatedBackground
      patternColor="primary"
      colorScheme="blue"
      className="min-h-screen"
    >
      <JobsList />
    </AnimatedBackground>
  );
}
