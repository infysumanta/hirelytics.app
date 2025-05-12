import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { getJobById } from "@/actions/jobs";
import { generateGeminiText } from "@/lib/ai-utils";

// Schema for validating the request body
const evaluateInterviewSchema = z.object({
  applicationId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { applicationId } = evaluateInterviewSchema.parse(body);

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

    // Check if interview is completed
    const interviewState = application.interviewState;
    if (!interviewState || interviewState.currentPhase !== "completed") {
      return NextResponse.json(
        { error: "Interview not completed" },
        { status: 400 },
      );
    }

    // Compile all interview chat messages for evaluation
    const interviewChat = application.interviewChatHistory || [];

    // Extract only user messages (candidate responses) and AI questions
    const candidateResponses = interviewChat.filter(
      (msg: { sender: string; questionId?: string }) =>
        msg.sender === "user" || (msg.sender === "ai" && msg.questionId),
    );

    // Format messages for evaluation
    const formattedChat = candidateResponses
      .map(
        (msg: { sender: string; questionCategory?: string; text: string }) => {
          if (msg.sender === "ai") {
            return `QUESTION (${msg.questionCategory}): ${msg.text}`;
          } else {
            return `CANDIDATE RESPONSE: ${msg.text}`;
          }
        },
      )
      .join("\n\n");

    // Create evaluation prompt
    const evaluationPrompt = `
      You are an AI evaluator reviewing an interview for the ${job.title} position at ${job.companyName}.
      Below is the transcript of the interview questions and candidate responses.
      
      JOB DESCRIPTION:
      ${job.description || "No detailed job description available."}
      
      REQUIRED SKILLS:
      ${job.skills?.join(", ") || "not specified"}.
      
      INTERVIEW TRANSCRIPT:
      ${formattedChat}
      
      Based on the interview transcript, please evaluate the candidate on:
      
      1. Technical Skills (Rate 1-5):
         - Assess the candidate's technical knowledge related to the job requirements
         - Evaluate their problem-solving approach
         - Consider depth and accuracy of technical explanations
      
      2. Communication Skills (Rate 1-5):
         - Clarity and structure in responses
         - Ability to explain technical concepts
         - Professional communication style
      
      3. Problem-Solving (Rate 1-5):
         - Structured approach to problems
         - Consideration of alternatives
         - Critical thinking
      
      4. Cultural Fit (Rate 1-5):
         - Alignment with company values
         - Team collaboration approach
         - Work style preferences
      
      5. Top 3 Strengths (Brief bullet points)
      
      6. Areas of Improvement (Brief bullet points)
      
      7. Overall Recommendation (Brief paragraph, max 3 sentences)
      
      Format your response as follows:
      
      TECHNICAL_SKILLS: [1-5]
      COMMUNICATION_SKILLS: [1-5]
      PROBLEM_SOLVING: [1-5]
      CULTURAL_FIT: [1-5]
      
      STRENGTHS:
      - [Strength 1]
      - [Strength 2]
      - [Strength 3]
      
      AREAS_OF_IMPROVEMENT:
      - [Area 1]
      - [Area 2]
      - [Area 3]
      
      OVERALL_IMPRESSION:
      [Brief overall recommendation, max 3 sentences]
    `;

    // Generate evaluation
    const evaluationResponse = await generateGeminiText(
      evaluationPrompt,
      "gemini-2.0-flash-lite",
    );

    // Parse the response to extract ratings and feedback
    const technicalMatch = evaluationResponse.match(
      /TECHNICAL_SKILLS:\s*(\d+)/,
    );
    const communicationMatch = evaluationResponse.match(
      /COMMUNICATION_SKILLS:\s*(\d+)/,
    );
    const problemSolvingMatch = evaluationResponse.match(
      /PROBLEM_SOLVING:\s*(\d+)/,
    );
    const cultureFitMatch = evaluationResponse.match(/CULTURAL_FIT:\s*(\d+)/);

    const strengthsMatch = evaluationResponse.match(
      /STRENGTHS:([\s\S]*?)(?=AREAS_OF_IMPROVEMENT:|$)/,
    );
    const areasMatch = evaluationResponse.match(
      /AREAS_OF_IMPROVEMENT:([\s\S]*?)(?=OVERALL_IMPRESSION:|$)/,
    );
    const overallMatch = evaluationResponse.match(
      /OVERALL_IMPRESSION:([\s\S]*?)$/,
    );

    // Extract strengths as array
    const strengths: string[] = [];
    if (strengthsMatch && strengthsMatch[1]) {
      const strengthsText = strengthsMatch[1].trim();
      const strengthLines = strengthsText
        .split("\n")
        .filter((line) => line.trim().startsWith("-"));
      strengthLines.forEach((line) => {
        const strength = line.replace("-", "").trim();
        if (strength) strengths.push(strength);
      });
    }

    // Extract areas of improvement as array
    const areasOfImprovement: string[] = [];
    if (areasMatch && areasMatch[1]) {
      const areasText = areasMatch[1].trim();
      const areaLines = areasText
        .split("\n")
        .filter((line) => line.trim().startsWith("-"));
      areaLines.forEach((line) => {
        const area = line.replace("-", "").trim();
        if (area) areasOfImprovement.push(area);
      });
    }

    // Extract overall impression
    let overallImpression = "";
    if (overallMatch && overallMatch[1]) {
      overallImpression = overallMatch[1].trim();
    }

    // Prepare feedback object
    const feedback = {
      technicalSkills: technicalMatch
        ? parseInt(technicalMatch[1], 10)
        : undefined,
      communicationSkills: communicationMatch
        ? parseInt(communicationMatch[1], 10)
        : undefined,
      problemSolving: problemSolvingMatch
        ? parseInt(problemSolvingMatch[1], 10)
        : undefined,
      cultureFit: cultureFitMatch
        ? parseInt(cultureFitMatch[1], 10)
        : undefined,
      overallImpression,
      strengths,
      areasOfImprovement,
    };

    // Update application with evaluation

    // Save the full evaluation response to chat history as a system message
    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $push: {
          interviewChatHistory: {
            text: `## Interview Evaluation\n\n${evaluationResponse}`,
            sender: "system",
            timestamp: new Date(),
          },
        },
      },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      feedback,
      evaluationText: evaluationResponse,
    });
  } catch (error) {
    console.error("Error evaluating interview:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
