import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import Job from "@/models/job";
import { auth } from "@/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client } from "@/lib/s3-client";
import pdf from "pdf-parse";
import { generateGeminiText, parseGeminiMatchResponse } from "@/lib/ai-utils";

// Create S3 client
const s3Client = createS3Client();

// Extract text from PDF
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Extract skills from text
function extractSkills(text: string): string[] {
  // Simplistic approach - in a real application you'd want to use NLP
  // This is just a basic example to identify some common skills
  const skillsList = [
    "javascript",
    "typescript",
    "react",
    "node",
    "python",
    "java",
    "c++",
    "mongodb",
    "sql",
    "aws",
    "docker",
    "kubernetes",
    "html",
    "css",
    "angular",
    "vue",
    "express",
    "spring",
    "django",
  ];

  const foundSkills = skillsList.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase()),
  );

  return foundSkills;
}

// Extract experience from text
function extractExperience(text: string): {
  years: number;
  companies: string[];
} {
  // Basic regex patterns to find experience
  const yearsPattern = /(\d+)[\s+]*(years|year)[\s+]*(of)?[\s+]*experience/gi;
  const yearsMatch = yearsPattern.exec(text);

  const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;

  // This is a very simplistic approach - would need more sophisticated NLP in production
  const companyPattern =
    /(?:worked at|working at|employed at|employment at|work at)[\s+]*([A-Z][A-Za-z\s]+?)[\s+]*(?:from|since|for|as|in|,|\\.)/g;
  const companies: string[] = [];

  let match;
  while ((match = companyPattern.exec(text)) !== null) {
    companies.push(match[1].trim());
  }

  return { years, companies };
}

// Extract education from text
function extractEducation(
  text: string,
): { degree: string; institution: string }[] {
  // Very basic pattern matching - real implementation would use NLP
  const degrees = [
    "Bachelor",
    "Master",
    "PhD",
    "Doctorate",
    "BSc",
    "MSc",
    "BA",
    "MA",
    "MBA",
  ];

  const education: { degree: string; institution: string }[] = [];

  // This is a very naive implementation that would need to be improved
  for (const degree of degrees) {
    const pattern = new RegExp(
      `(${degree}[\\w\\s]*?)\\s+(?:from|at)\\s+([A-Z][A-Za-z\\s]+)`,
      "gi",
    );
    let match;
    while ((match = pattern.exec(text)) !== null) {
      education.push({
        degree: match[1].trim(),
        institution: match[2].trim(),
      });
    }
  }

  return education;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 },
      );
    }

    // Get options from request body
    const body = await req.json().catch(() => ({}));
    const { runMatching = true } = body; // Default to true - always run matching unless explicitly disabled

    const { id } = await params;
    const application = await JobApplication.findById(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Get the PDF from S3 if we have s3Key and s3Bucket
    let pdfBuffer: Buffer;

    if (application.s3Key && application.s3Bucket) {
      try {
        // Get pre-signed URL
        const command = new GetObjectCommand({
          Bucket: application.s3Bucket,
          Key: application.s3Key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 300,
        });
        console.log({ signedUrl });

        // Fetch the PDF content
        const response = await fetch(signedUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
      } catch (error) {
        console.error("Error fetching PDF from S3:", error);
        return NextResponse.json(
          { error: "Failed to retrieve PDF from storage" },
          { status: 500 },
        );
      }
    } else if (application.resumeBase64) {
      // Extract buffer from base64
      try {
        const base64Data = application.resumeBase64.split(",")[1];
        pdfBuffer = Buffer.from(base64Data, "base64");
      } catch (error) {
        console.error("Error extracting PDF from base64:", error);
        return NextResponse.json(
          { error: "Failed to process PDF from base64 data" },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "No PDF data available for this application" },
        { status: 400 },
      );
    }

    // Extract text from PDF
    let parsedText: string;
    try {
      parsedText = await extractTextFromPDF(pdfBuffer);
    } catch (error) {
      console.error("Error parsing PDF:", error);
      return NextResponse.json(
        { error: "Failed to parse resume PDF" },
        { status: 500 },
      );
    }

    // Extract information from the text
    const skills = extractSkills(parsedText);
    const experience = extractExperience(parsedText);
    const education = extractEducation(parsedText);

    // Create parsed resume object with optional matching fields
    const parsedResume = {
      extractedText: parsedText,
      skills,
      experience,
      education,
      analyzedAt: new Date(),
      matchScore: undefined as number | undefined,
      aiComments: undefined as string | undefined,
      matchedAt: undefined as Date | undefined,
      topSkillMatches: undefined as string[] | undefined,
      missingSkills: undefined as string[] | undefined,
    };

    // If runMatching is true, also perform matching against job description
    let matchResult = null;
    if (runMatching) {
      try {
        // Get the job details directly
        const job = await Job.findById(application.jobId);

        if (job) {
          // Extract relevant information for matching
          const { title, description, requirements, skills: jobSkills } = job;

          // Create prompt for Gemini
          const prompt = `
            I need you to analyze a job candidate's resume against a job description and provide a comprehensive assessment. 
            
            Job Information:
            Title: ${title}
            Description: ${description}
            Required Skills: ${jobSkills.join(", ")}
            ${requirements ? `Additional Requirements: ${requirements}` : ""}

            Candidate Information:
            Resume Text: ${parsedText.substring(0, 5000)} ${parsedText.length > 5000 ? "...(truncated)" : ""}
            Identified Skills: ${skills.join(", ")}
            Experience: ${experience.years} years at companies: ${experience.companies.join(", ")}
            Education: ${education.map((e: { degree: string; institution: string }) => `${e.degree} from ${e.institution}`).join("; ")}

            Format your response exactly as follows:
            
            Score: [0-100]
            Analysis: [150-300 words analyzing the candidate's fit for the role, strengths, and weaknesses]
            Top Skills: [List the most relevant matching skills, separated by commas]
            Missing Skills: [List critical skills from the job description that the candidate appears to lack, separated by commas]
            
            Make sure to provide a fair and objective assessment. The score should reflect how well the candidate's qualifications match the job requirements, with 100 being a perfect match.
          `;

          // Generate match score and analysis with Gemini
          const geminiResponse = await generateGeminiText(prompt);

          // Parse the response with our enhanced parser
          const {
            score: matchScore,
            analysis: aiComments,
            topMatches: topSkillMatches,
            missingSkills,
          } = parseGeminiMatchResponse(geminiResponse);

          // Update parsed resume with matching data and additional fields
          parsedResume.matchScore = matchScore;
          parsedResume.aiComments = aiComments;
          parsedResume.matchedAt = new Date();

          // Include additional data if available
          if (topSkillMatches) parsedResume.topSkillMatches = topSkillMatches;
          if (missingSkills) parsedResume.missingSkills = missingSkills;

          matchResult = {
            success: true,
            match: {
              score: matchScore,
              comments: aiComments,
              matchedAt: parsedResume.matchedAt,
              topSkillMatches: parsedResume.topSkillMatches,
              missingSkills: parsedResume.missingSkills,
            },
          };
        } else {
          console.error("Job not found for application:", application.jobId);
        }
      } catch (matchError) {
        console.error("Error during match process:", matchError);
      }
    }

    // Store the parsed data in the application (including any match data)
    application.parsedResume = parsedResume;
    await application.save();

    return NextResponse.json({
      success: true,
      message: "Resume analyzed successfully",
      application: {
        ...application.toJSON(),
        resumeBase64: "**base64 data stored**", // Don't expose the full base64 data
      },
      matching: matchResult,
    });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 },
    );
  }
}
