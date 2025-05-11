import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware will capture requests to the old URL pattern and redirect to the new one
// Note: This only works if applications can be retrieved by job ID
export function middleware(request: NextRequest) {
  // Extract the job ID from the URL
  // const jobId = request.nextUrl.pathname.split("/")[3]; // Gets the [id] part from /dashboard/jobs/[id]/...

  // Redirect to the applications listing filtered by job ID
  // The actual application ID should be obtained from the database via API
  return NextResponse.redirect(new URL(`/dashboard/jobs`, request.url));
}
