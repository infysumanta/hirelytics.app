import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { auth } from "@/auth";
import Job from "@/models/job";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to access application data",
        },
        { status: 401 },
      );
    }

    const id = params.id;

    // Fetch application by ID
    const application = await JobApplication.findById(id);
    const job = await Job.findById(application.jobId);

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    // Get query parameter to include base64 data or not
    const url = new URL(req.url);
    const includeBase64 = url.searchParams.get("includeBase64") === "true";

    // Return application data
    const response = {
      success: true,
      application: {
        ...application.toJSON(),
        // Only include base64 data if specifically requested
        ...(includeBase64 ? {} : { resumeBase64: "**base64 data stored**" }),
        job: job,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch application details" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to update application data",
        },
        { status: 401 },
      );
    }

    const id = params.id;

    // Find the application
    const application = await JobApplication.findById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    // Get request body
    const data = await req.json();

    // Only allow specific fields to be updated
    const allowedUpdates = {
      ...(data.status ? { status: data.status } : {}),
    };

    // Update application
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true },
    );

    // Return updated application
    return NextResponse.json({
      success: true,
      application: {
        ...updatedApplication.toJSON(),
        resumeBase64: "**base64 data stored**", // Don't expose the full base64 data
      },
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update application" },
      { status: 500 },
    );
  }
}
