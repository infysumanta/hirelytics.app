import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { getJobById } from "@/actions/jobs";
import { generateGeminiText } from "@/lib/ai-utils";

// Schema for validating request body
const initInterviewSchema = z.object({
  applicationId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { applicationId } = initInterviewSchema.parse(body);

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

    // Create system prompt for initialization
    const initPrompt = `
      You are an AI interviewer for ${job.companyName}. You're conducting an interview for the ${job.title} position.
      The job requires the following skills: ${job.skills?.join(", ") || "not specified"}.
      
      The candidate has submitted a resume with the following content:
      """
      ${application.resume?.text || "No resume text available"}
      """
      
      Please provide a professional, friendly greeting and first interview question that's relevant to the job role.
      Keep your response concise (2-3 sentences maximum) and end with a specific question related to the candidate's background or the job requirements.
    `;

    // Generate initial greeting and question
    const initialGreeting = await generateGeminiText(
      initPrompt,
      "gemini-1.5-pro",
    );

    return NextResponse.json({
      greeting: initialGreeting,
      jobTitle: job.title,
      companyName: job.companyName,
      applicationId,
    });
  } catch (error) {
    console.error("Error initializing interview:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
