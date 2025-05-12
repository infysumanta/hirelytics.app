import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";

const historyRequestSchema = z.object({
  applicationId: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    // Extract applicationId from query params
    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    // Parse and validate applicationId
    historyRequestSchema.parse({ applicationId });

    // Connect to database
    await connectToDatabase();

    // Fetch application with chat history
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Return the chat history
    return NextResponse.json({
      history: application.interviewChatHistory || [],
      applicationId,
    });
  } catch (error) {
    console.error("Error fetching interview chat history:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Extract applicationId from query params
    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    // Parse and validate applicationId
    historyRequestSchema.parse({ applicationId });

    // Connect to database
    await connectToDatabase();

    // Clear chat history for the application
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      applicationId,
      { $set: { interviewChatHistory: [] } },
      { new: true },
    );

    if (!updatedApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Chat history cleared successfully",
      applicationId,
    });
  } catch (error) {
    console.error("Error clearing interview chat history:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
