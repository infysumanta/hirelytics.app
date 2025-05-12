import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { getJobById } from "@/actions/jobs";
import { generateGeminiText } from "@/lib/ai-utils";

// Schema for validating request body
const initInterviewSchema = z.object({
  applicationId: z.string(),
  forceRestart: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { applicationId, forceRestart } = initInterviewSchema.parse(body);

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

    // Get job details
    const job = await getJobById(application.jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if there's existing chat history and we're not forcing a restart
    const existingChatHistory = application.interviewChatHistory || [];

    if (existingChatHistory.length > 0 && !forceRestart) {
      // Check if the interview is already completed
      const interviewState = application.interviewState || {};
      const isCompleted = interviewState.currentPhase === "completed";

      // Return the existing chat history and preserve the current state
      return NextResponse.json({
        greeting: null, // No need for new greeting
        jobTitle: job.title,
        companyName: job.companyName,
        applicationId,
        hasExistingChat: true,
        chatHistory: existingChatHistory,
        isCompleted: isCompleted,
      });
    }

    // Create system prompt for initialization with job description and resume details
    const initPrompt = `
      You are an AI interviewer for ${job.companyName}. You're conducting an interview for the ${job.title} position.
      
      JOB DESCRIPTION:
      ${job.description || "No detailed job description available."}
      
      REQUIRED SKILLS:
      ${job.skills?.join(", ") || "not specified"}.
      
      CANDIDATE'S RESUME:
      """
      ${application.parsedResume?.extractedText || "No resume text available"}
      """
      
      You'll be conducting a structured interview process with the following phases:
      
      1. Introduction: Introduce yourself professionally with a brief welcome message and explain the interview process. 
      2. Brief Candidate Introduction: Ask the candidate for a brief introduction/overview of their background.
      3. Technical Questions: After their introduction, provide brief feedback and then proceed to ask 3 technical questions, one at a time.
      4. Project Discussion: After technical questions, ask about their most significant project and ask 3 follow-up questions about it.
      5. Behavioral Questions: Ask 3 behavioral questions about work environment preferences and collaboration style.
      6. Conclusion: Thank the candidate with a professional closing message.
      
      Your initial response should be just the introduction and request for the candidate to introduce themselves. Be professional, confident, and take control of the interview process. Explain that you'll be asking technical, project-related, and behavioral questions, and that you'll provide evaluation feedback after the interview. Set the expectation that you'll be guiding the conversation structure. Keep responses concise (2-3 sentences maximum).
    `;

    // Generate initial greeting and question
    const initialGreeting = await generateGeminiText(
      initPrompt,
      "gemini-2.0-flash-lite",
    );

    // Create a system message with job description and complete parsed resume data
    const systemMessage = `
# Interview for: ${job.title} at ${job.companyName}

## Job Description:
${job.description || "No detailed job description available."}

## Required Skills:
${job.skills?.join(", ") || "not specified"}.

## Resume Data:
${
  application.parsedResume
    ? `
Skills: ${application.parsedResume.skills?.join(", ") || "Not specified"}

Experience: ${application.parsedResume.experience?.years || "Unknown"} years
${
  application.parsedResume.experience?.companies?.length
    ? `Companies: ${application.parsedResume.experience.companies.join(", ")}`
    : "No company information available"
}

Education: ${
        application.parsedResume.education
          ?.map(
            (edu: { degree?: string; institution?: string }) =>
              `${edu.degree || "Degree"} - ${edu.institution || "Institution"}`,
          )
          .join("\n") || "No education information available"
      }

About: ${application.parsedResume.about || "No summary available"}
`
    : "Resume data not available."
}
    `.trim();

    // Get the current application to ensure we have the most up-to-date state
    const currentApplication = await JobApplication.findById(applicationId);
    if (!currentApplication) {
      return NextResponse.json(
        { error: "Application no longer exists" },
        { status: 404 },
      );
    }

    // Initialize the chat history if it doesn't exist yet or if we're forcing a restart
    if (
      !currentApplication.interviewChatHistory ||
      currentApplication.interviewChatHistory.length === 0 ||
      forceRestart
    ) {
      // If we're forcing a restart, log it
      if (forceRestart) {
        console.log(
          `[Interview Init] Forcing restart for application ${applicationId}`,
        );
      }

      // Save both system message and initial AI greeting to the database and initialize interview state
      await JobApplication.findByIdAndUpdate(
        applicationId,
        {
          $set: {
            interviewChatHistory: [
              {
                text: systemMessage,
                sender: "system",
                timestamp: new Date(),
              },
              {
                text: initialGreeting,
                sender: "ai",
                timestamp: new Date(),
              },
            ],
            interviewState: {
              currentPhase: "introduction",
              technicalQuestionsAsked: 0,
              projectQuestionsAsked: 0,
              behavioralQuestionsAsked: 0,
              askedQuestions: [],
            },
          },
        },
        { new: true },
      );
    }

    // Create the messages that will be returned as the initial chat history
    const initialChatHistory = [
      {
        text: systemMessage,
        sender: "system",
        timestamp: new Date(),
      },
      {
        text: initialGreeting,
        sender: "ai",
        timestamp: new Date(),
      },
    ];

    return NextResponse.json({
      greeting: initialGreeting,
      jobTitle: job.title,
      companyName: job.companyName,
      applicationId,
      hasExistingChat: false,
      chatHistory: initialChatHistory, // Return the newly created messages
    });
  } catch (error) {
    console.error("Error initializing interview:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
