import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateGeminiText } from "@/lib/ai-utils";
import { JobApplication } from "@/models/job-application";
import { getJobById } from "@/actions/jobs";
import { connectToDatabase } from "@/lib/mongodb";

// Schema for validating the request body
const interviewChatSchema = z.object({
  applicationId: z.string(),
  message: z.string(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "system", "assistant"]),
        content: z.string(),
      }),
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const {
      applicationId,
      message,
      history = [],
    } = interviewChatSchema.parse(body);

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

    // Create system prompt with job and resume context
    const systemPrompt = `
      You are a professional AI interviewer conducting an interview for the ${job.title} position at ${job.companyName}. 
      The candidate has applied with the following resume: "${application.resume?.text || "No resume provided"}".
      The job requires these skills: ${job.skills?.join(", ") || "various technical and soft skills"}.
      
      Your task is to:
      1. Ask relevant technical and behavioral questions one at a time
      2. Follow-up on candidate responses with appropriate questions
      3. Be professional but conversational
      4. Assess candidate's fit for the role
      5. Stick to relevant interview topics
      6. Keep responses concise (maximum 2-3 sentences)
      
      Current conversation context: The interview is in progress.
    `;

    // Convert history to proper format for Gemini
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Format final prompt with system context, history and current message
    const finalPrompt = `
      ${systemPrompt}
      
      ${formattedHistory.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")}
      
      USER: ${message}
      
      ASSISTANT:
    `;

    // Generate AI response
    const response = await generateGeminiText(
      finalPrompt,
      "gemini-2.0-flash-lite",
    );

    // Save user message to database
    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $push: {
          interviewChatHistory: [
            {
              text: message,
              sender: "user",
              timestamp: new Date(),
            },
            {
              text: response,
              sender: "ai",
              timestamp: new Date(),
            },
          ],
        },
      },
      { new: true },
    );

    return NextResponse.json({
      response,
      applicationId,
    });
  } catch (error) {
    console.error("Error in interview chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
