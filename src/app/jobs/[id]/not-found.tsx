import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function JobNotFound() {
  return (
    <AnimatedBackground
      patternColor="primary"
      colorScheme="blue"
      className="min-h-screen"
    >
      <div className="container max-w-4xl py-16 px-4 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Job Not Found</h1>
        <p className="text-muted-foreground text-lg text-center mb-8">
          The job listing you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/jobs">
          <Button size="lg">Browse All Jobs</Button>
        </Link>
      </div>
    </AnimatedBackground>
  );
}
