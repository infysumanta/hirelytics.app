import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { auth } from "@/auth";
import Job from "@/models/job";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to update application status",
        },
        { status: 401 },
      );
    }

    // Only recruiters can update application status
    if (session.user?.role !== "recruiter") {
      return NextResponse.json(
        { error: "Unauthorized. Recruiter access required." },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Verify the application exists
    const application = await JobApplication.findById(id);
    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    // Verify the recruiter has permission to update this application
    // by checking if they are assigned to the job
    const job = await Job.findById(application.jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Associated job not found" },
        { status: 404 },
      );
    }

    // Check if the current recruiter is assigned to this job
    if (job.recruiter.toString() !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. You are not the recruiter for this job.",
        },
        { status: 403 },
      );
    }

    // Get request body
    const data = await req.json();

    // Validate status
    if (
      !data.status ||
      !["pending", "reviewed", "accepted", "rejected"].includes(data.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Must be one of: pending, reviewed, accepted, rejected",
        },
        { status: 400 },
      );
    }

    // Update application status
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { $set: { status: data.status } },
      { new: true },
    );

    // Return updated application
    return NextResponse.json({
      success: true,
      message: `Application status updated to ${data.status}`,
      application: {
        ...updatedApplication.toJSON(),
        resumeBase64: "**base64 data stored**", // Don't expose the full base64 data
      },
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update application status" },
      { status: 500 },
    );
  }
}
