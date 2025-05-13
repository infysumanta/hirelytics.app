import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  getMongoConnectionStatus,
} from "@/lib/mongodb-debug";
import { JobApplication } from "@/models/job-application";

// Import the interface for chat messages
interface InterviewMessage {
  text: string;
  sender: "ai" | "user" | "system";
  timestamp: Date;
  questionId?: string;
  questionCategory?: string;
  feedback?: string;
}

export async function GET(req: NextRequest) {
  try {
    // Extract applicationId from the URL query params
    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    // Connect to the database
    console.log("[Debug API] Connecting to MongoDB...");
    await connectToDatabase();

    // Get connection status
    const connectionStatus = getMongoConnectionStatus();
    console.log("[Debug API] MongoDB connection status:", connectionStatus);

    if (!connectionStatus.isConnected) {
      return NextResponse.json(
        {
          error: "MongoDB not connected",
          connectionStatus,
        },
        { status: 500 },
      );
    }

    // Try to fetch the application
    console.log("[Debug API] Fetching application:", applicationId);
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Return chat history debug info
    return NextResponse.json({
      applicationId,
      chatHistoryExists: !!application.interviewChatHistory,
      chatHistoryLength: application.interviewChatHistory?.length || 0,
      interviewStateExists: !!application.interviewState,
      interviewState: application.interviewState,
      connectionStatus,
      lastMessagesPreview: application.interviewChatHistory
        ? application.interviewChatHistory
            .slice(-2)
            .map((msg: InterviewMessage) => ({
              sender: msg.sender,
              timestamp: msg.timestamp,
              textPreview: msg.text?.substring(0, 30) + "...",
            }))
        : [],
    });
  } catch (error) {
    console.error("[Debug API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

// Special endpoint to test saving chat history
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, testMessage } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectToDatabase();
    const connectionStatus = getMongoConnectionStatus();
    console.log("[Debug API] MongoDB connection status:", connectionStatus);

    // Get the current application
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Get current chat history or initialize
    const currentChatHistory = application.interviewChatHistory || [];

    // Create a test message to add
    const newMessage: InterviewMessage = {
      text: testMessage || `Debug test message at ${new Date().toISOString()}`,
      sender: "system",
      timestamp: new Date(),
    };

    // Update the application with the new message
    console.log("[Debug API] Attempting to save test message");
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $set: {
          interviewChatHistory: [...currentChatHistory, newMessage],
        },
      },
      { new: true },
    );

    if (!updatedApplication) {
      console.error("[Debug API] Failed to update application");
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 },
      );
    }

    // Verify the update
    const verifyApp = await JobApplication.findById(applicationId);
    const verifySuccess =
      verifyApp &&
      verifyApp.interviewChatHistory &&
      verifyApp.interviewChatHistory.length === currentChatHistory.length + 1;

    // Return the result
    return NextResponse.json({
      applicationId,
      success: !!updatedApplication,
      verificationSuccess: verifySuccess,
      previousLength: currentChatHistory.length,
      currentLength: updatedApplication.interviewChatHistory?.length || 0,
      lastMessage: updatedApplication.interviewChatHistory
        ? (updatedApplication.interviewChatHistory[
            updatedApplication.interviewChatHistory.length - 1
          ] as InterviewMessage)
        : null,
    });
  } catch (error) {
    console.error("[Debug API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
