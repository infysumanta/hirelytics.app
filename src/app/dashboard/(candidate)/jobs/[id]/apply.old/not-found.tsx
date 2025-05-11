import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ApplyNotFound() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center text-center">
      <AlertCircle className="h-24 w-24 text-destructive/50" />
      <h1 className="text-3xl font-bold mt-6">Application Not Available</h1>
      <p className="text-lg text-muted-foreground mt-2 max-w-md">
        This job listing has expired or is no longer accepting applications.
      </p>
      <div className="mt-8">
        <Link href="/dashboard/jobs">
          <Button>Browse other opportunities</Button>
        </Link>
      </div>
    </div>
  );
}
