import { FileSearch } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function JobDetailNotFound() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center text-center">
      <FileSearch className="h-24 w-24 text-primary/50" />
      <h1 className="text-3xl font-bold mt-6">Job Not Found</h1>
      <p className="text-lg text-muted-foreground mt-2 max-w-md">
        The job listing you&apos;re looking for doesn&apos;t exist, has been removed, or has
        expired.
      </p>
      <div className="mt-8">
        <Link href="/dashboard/jobs">
          <Button>Browse available jobs</Button>
        </Link>
      </div>
    </div>
  );
}
