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
// Extract candidate summary/about section
function extractCandidateAbout(text: string): string {
  const patterns = [
    /(?:Profile|Summary|About|Objective)[:]\s*([^]*?)(?=\n\n|\n[A-Z]|$)/i,
    /(?:Career\s+(?:Profile|Summary|Objective))[:]\s*([^]*?)(?=\n\n|\n[A-Z]|$)/i,
    /(?:Professional\s+(?:Profile|Summary))[:]\s*([^]*?)(?=\n\n|\n[A-Z]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const summary = match[1].trim();
      // Only return if it's a reasonable length for a summary
      if (summary.length > 20 && summary.length < 1000) {
        return summary;
      }
    }
  }

  // If no specific summary section found, try to extract the first relevant paragraph
  const firstParagraphs = text.split(/\n\s*\n/).slice(0, 2);
  for (const para of firstParagraphs) {
    const cleaned = para.trim();
    if (
      cleaned.length > 50 &&
      cleaned.length < 1000 &&
      !cleaned.match(/^(?:email|phone|address|education|experience|skills):/i)
    ) {
      return cleaned;
    }
  }

  return "";
}

function extractExperience(text: string): {
  years: number;
  companies: string[];
} {
  // Enhanced regex patterns to find experience
  const yearsPatterns = [
    /(\d+)[\s+]*(years|year)[\s+]*(of)?[\s+]*experience/gi,
    /experience[\s+]*:[\s+]*(\d+)[\s+]*(years|year)/gi,
    /(\d+)[\s+]*(years|year)[\s+]*(of)?[\s+]*work[\s+]*experience/gi,
    /professional[\s+]*experience[\s+]*:[\s+]*(\d+)[\s+]*(years|year)/gi,
  ];

  let years = 0;
  for (const pattern of yearsPatterns) {
    const yearsMatch = pattern.exec(text);
    if (yearsMatch) {
      // Find which capture group has the number
      const captureIndex = yearsMatch[1].match(/\d+/)
        ? 1
        : yearsMatch[2].match(/\d+/)
          ? 2
          : 0;
      if (captureIndex > 0) {
        years = parseInt(yearsMatch[captureIndex]);
        break;
      }
    }
  }

  // Enhanced company extraction patterns
  const companyPatterns = [
    /(?:worked at|working at|employed at|employment at|work at)[\s+]*([A-Z][A-Za-z0-9\s\.\,\&\-]+?)[\s+]*(?:from|since|for|as|in|,|\.)/gi,
    /(?:at|with|for)[\s+]*([A-Z][A-Za-z0-9\s\.\,\&\-]+?)[\s+]*(?:from|since|as|in|,|\.|where)/gi,
    /([A-Z][A-Za-z0-9\.\&\-]+(?:\s+[A-Za-z0-9\.\&\-]+){0,3})[\s+]*(?:\||,|\-)[\s+]*(?:[A-Za-z]+\s){1,3}(?:developer|engineer|manager|consultant|specialist|analyst|designer|director|lead|head|architect|administrator)/gi,
    /EXPERIENCE[\s\n]+([A-Z][A-Za-z0-9\s\.\,\&\-]+?)[\s+]*(?:\||,|\-|–|:)/gi,
  ];

  const companies: string[] = [];
  const processedCompanies = new Set<string>(); // To avoid duplicates

  for (const pattern of companyPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const company = match[1].trim();
      // Filter out common false positives and very short names
      if (
        company.length > 2 &&
        !company.match(
          /^(Resume|CV|Name|Address|Email|Phone|City|State|Experience|Education|From|To|Skills|References|January|February|March|April|May|June|July|August|September|October|November|December)$/i,
        ) &&
        !processedCompanies.has(company.toLowerCase())
      ) {
        companies.push(company);
        processedCompanies.add(company.toLowerCase());
      }
    }
  }

  return { years, companies };
}

// Extract education from text
function extractEducation(
  text: string,
): { degree: string; institution: string }[] {
  // Enhanced list of degree types and abbreviations
  const degrees = [
    "Bachelor",
    "Master",
    "PhD",
    "Doctorate",
    "BSc",
    "MSc",
    "BS",
    "MS",
    "BA",
    "MA",
    "MBA",
    "BBA",
    "BEng",
    "MEng",
    "B\\.S\\.",
    "M\\.S\\.",
    "B\\.A\\.",
    "M\\.A\\.",
    "B\\.B\\.A\\.",
    "M\\.B\\.A\\.",
    "B\\.E\\.",
    "M\\.E\\.",
    "B\\.Tech",
    "M\\.Tech",
    "Associate",
    "Certificate",
    "Diploma",
  ];

  const education: { degree: string; institution: string }[] = [];
  const processedInstitutions = new Set<string>(); // To avoid duplicates

  // Pattern 1: Degree from University
  for (const degree of degrees) {
    const pattern = new RegExp(
      `(${degree}[\\w\\s\\.]*(?:in|of)?\\s*[\\w\\s\\.]*)\\s+(?:from|at|in|degree|-)\\s+([A-Z][A-Za-z0-9\\s\\.\\-&,]+)`,
      "gi",
    );
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const degreeText = match[1].trim();
      const institution = match[2].trim();

      // Filter out false positives
      if (
        !institution.match(
          /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Resume|CV|Name|Address|Email|Phone|City|State|Experience|Education)$/i,
        ) &&
        !processedInstitutions.has(institution.toLowerCase())
      ) {
        education.push({
          degree: degreeText,
          institution: institution,
        });
        processedInstitutions.add(institution.toLowerCase());
      }
    }
  }

  // Pattern 2: University - Degree format
  const universityDegreePattern =
    /([A-Z][A-Za-z0-9\s\.\-&,]+)(?:\s*[-–|]\s*|\s*:\s*|\n+\s*)(?:Degree|Diploma|Certificate)?:?\s*((?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BS|MS|BA|MA|MBA|BBA|BEng|MEng|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.B\.A\.|M\.B\.A\.|B\.E\.|M\.E\.|B\.Tech|M\.Tech|Associate|Certificate|Diploma)[^,\n\d]*)/gi;

  let match;
  while ((match = universityDegreePattern.exec(text)) !== null) {
    const institution = match[1].trim();
    const degreeText = match[2].trim();

    // Filter out false positives
    if (
      !institution.match(
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Resume|CV|Name|Address|Email|Phone|City|State|Experience|Education)$/i,
      ) &&
      !processedInstitutions.has(institution.toLowerCase())
    ) {
      education.push({
        degree: degreeText,
        institution: institution,
      });
      processedInstitutions.add(institution.toLowerCase());
    }
  }

  // Pattern 3: Look for EDUCATION section followed by institution and degree
  const educationSectionPattern =
    /EDUCATION[\s\n]+([A-Z][A-Za-z0-9\s\.\-&,]+)[\s\n]+([^,\n\d]*(?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BS|MS|BA|MA|MBA|BBA|BEng|MEng|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.B\.A\.|M\.B\.A\.|B\.E\.|M\.E\.|B\.Tech|M\.Tech)[^,\n\d]*)/gi;

  while ((match = educationSectionPattern.exec(text)) !== null) {
    const institution = match[1].trim();
    const degreeText = match[2].trim();

    if (!processedInstitutions.has(institution.toLowerCase())) {
      education.push({
        degree: degreeText,
        institution: institution,
      });
      processedInstitutions.add(institution.toLowerCase());
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
    const about = extractCandidateAbout(parsedText);

    // Create parsed resume object with optional matching fields
    const parsedResume = {
      extractedText: parsedText,
      about,
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

            First, verify and enhance the extracted information:
            1. If the identified skills seem incomplete, extract additional relevant skills from the resume
            2. If the experience information seems incomplete, identify companies and years of experience more comprehensively
            3. If the education information seems incomplete, extract degree and institution information more accurately

            Then provide your assessment in the following format:
            
            Score: [0-100]
            Analysis: [150-300 words analyzing the candidate's fit for the role, strengths, and weaknesses]
            Top Skills: [List the most relevant matching skills, separated by commas]
            Missing Skills: [List critical skills from the job description that the candidate appears to lack, separated by commas]
            Experience: [Enhanced information about work experience including years and companies]
            Education: [Enhanced information about education including degrees and institutions]
            
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
            enhancedExperience,
            enhancedEducation,
          } = parseGeminiMatchResponse(geminiResponse);

          // Update parsed resume with matching data and additional fields
          parsedResume.matchScore = matchScore;
          parsedResume.aiComments = aiComments;
          parsedResume.matchedAt = new Date();

          // If AI found better experience data, update it
          if (enhancedExperience) {
            if (enhancedExperience.years > parsedResume.experience.years) {
              parsedResume.experience.years = enhancedExperience.years;
            }
            if (enhancedExperience.companies.length > 0) {
              // Add any new companies found by AI that weren't in the original list
              const existingCompanies = new Set(
                parsedResume.experience.companies.map((c) => c.toLowerCase()),
              );
              const newCompanies = enhancedExperience.companies.filter(
                (c) => !existingCompanies.has(c.toLowerCase()),
              );
              parsedResume.experience.companies.push(...newCompanies);
            }
          }

          // If AI found better education data, update it
          if (enhancedEducation && enhancedEducation.length > 0) {
            // Only add new education entries that don't overlap with existing ones
            const existingEducation = new Set(
              parsedResume.education.map(
                (e) =>
                  `${e.degree.toLowerCase()}|${e.institution.toLowerCase()}`,
              ),
            );
            const newEducation = enhancedEducation.filter(
              (e) =>
                !existingEducation.has(
                  `${e.degree.toLowerCase()}|${e.institution.toLowerCase()}`,
                ),
            );
            parsedResume.education.push(...newEducation);
          }

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
