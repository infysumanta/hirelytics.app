import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";

export async function GET(req: NextRequest) {
  try {
    // Get application ID from query parameters
    const url = new URL(req.url);
    const applicationId = url.searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get application details
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Get interview state and questions
    const interviewState = application.interviewState;

    // Get chat history
    const interviewChat = application.interviewChatHistory || [];

    // Process chat history to extract questions and answers
    const questionsAndAnswers = [];
    let currentQuestion = null;

    for (const message of interviewChat) {
      if (message.sender === "ai" && message.questionId) {
        currentQuestion = {
          id: message.questionId,
          category: message.questionCategory,
          question: message.text,
          answer: null,
          feedback: message.feedback,
        };
        questionsAndAnswers.push(currentQuestion);
      } else if (
        message.sender === "user" &&
        currentQuestion &&
        !currentQuestion.answer
      ) {
        // This is likely the answer to the last question
        currentQuestion.answer = message.text;
      }
    }

    // Filter out questions without answers (might be the most recent question)
    const completedQA = questionsAndAnswers.filter((qa) => qa.answer !== null);

    return NextResponse.json({
      success: true,
      interviewState,
      questionsAndAnswers: completedQA,
      totalMessages: interviewChat.length,
      technicalQuestions: completedQA.filter(
        (qa) => qa.category === "technical",
      ).length,
      projectQuestions: completedQA.filter((qa) => qa.category === "project")
        .length,
      behavioralQuestions: completedQA.filter(
        (qa) => qa.category === "behavioral",
      ).length,
      isCompleted: interviewState?.currentPhase === "completed",
      hasEvaluation: !!interviewState?.feedback?.overallImpression,
      feedback: interviewState?.feedback,
    });
  } catch (error) {
    console.error("Error getting interview state:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
