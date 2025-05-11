import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { auth } from "@/auth";

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
