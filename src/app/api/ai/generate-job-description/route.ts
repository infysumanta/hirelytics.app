import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Helper function to check if user is a recruiter
async function isRecruiter() {
  const session = await auth();
  return session?.user?.role === "recruiter";
}

// Define schema for validation
const generateJobDescriptionSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is a recruiter
    if (!(await isRecruiter())) {
      return NextResponse.json(
        { error: "Unauthorized. Recruiter access required." },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { jobTitle, companyName, skills } =
      generateJobDescriptionSchema.parse(body);

    // Format skills for the prompt
    const skillsList = skills.join(", ");

    // Create the prompt for Gemini
    const prompt = `
      Generate a detailed job description for a ${jobTitle} position at ${companyName}.
      The required skills include: ${skillsList}.

      Include the following sections:
      1. About the Company
      2. Job Overview
      3. Responsibilities
      4. Requirements (including the mentioned skills)
      5. Benefits

      Make it professional, engaging, and around 300-500 words.
    `;

    // Use Gemini model with Vercel AI SDK
    const { text: generatedDescription } = await generateText({
      model: google("gemini-2.0-flash-lite"),
      prompt: prompt,
    });

    // Return the generated description
    return NextResponse.json({
      description: generatedDescription,
    });
  } catch (error) {
    console.error("Error generating job description:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to generate job description" },
      { status: 500 },
    );
  }
}
