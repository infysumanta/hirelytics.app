import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { auth } from "@/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client } from "@/lib/s3-client";
import pdf from "pdf-parse";

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
    console.log({ session });
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 },
      );
    }

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

    // Create parsed resume object
    const parsedResume = {
      extractedText: parsedText,
      skills,
      experience,
      education,
      analyzedAt: new Date(),
    };

    // Store the parsed data in the application
    application.parsedResume = parsedResume;
    await application.save();

    return NextResponse.json({
      success: true,
      message: "Resume analyzed successfully",
      application: {
        ...application.toJSON(),
        resumeBase64: "**base64 data stored**", // Don't expose the full base64 data
      },
    });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 },
    );
  }
}
