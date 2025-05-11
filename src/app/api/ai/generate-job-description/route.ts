import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

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

    // Create a prompt for the AI (not used in this mock implementation)
    // In a real implementation with Vercel AI SDK, you would use this prompt
    const _prompt = `
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

    // For now, we'll generate a mock response since we don't have the Vercel AI SDK set up yet
    // In a real implementation, you would call the Gemini API here
    const generatedDescription = `
# ${jobTitle} at ${companyName}

## About the Company
${companyName} is a leading organization in the industry, dedicated to innovation and excellence. We are committed to creating a positive work environment where employees can thrive and grow professionally.

## Job Overview
We are seeking a talented and motivated ${jobTitle} specialist to join our team. The ideal candidate will be passionate about their work and committed to delivering high-quality results.

## Responsibilities
- Collaborate with cross-functional teams to achieve project goals
- Develop and implement strategies to improve processes and outcomes
- Analyze data and provide insights to inform decision-making
- Communicate effectively with stakeholders at all levels
- Stay updated on industry trends and best practices

## Requirements
- Bachelor's degree in a relevant field
- 3+ years of experience in a similar role
- Strong analytical and problem-solving skills
- Excellent communication and interpersonal abilities
- Proficiency in the following skills: ${skillsList}
- Ability to work independently and as part of a team

## Benefits
- Competitive salary and benefits package
- Professional development opportunities
- Flexible work arrangements
- Collaborative and inclusive work environment
- Opportunity to work on impactful projects
    `;

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
