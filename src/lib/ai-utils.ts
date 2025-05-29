import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

/**
 * Generates text using Google's Gemini model via Vercel AI SDK
 *
 * @param prompt - The prompt to send to the model
 * @param model - The specific Gemini model to use (defaults to gemini-2.0-flash-lite)
 * @returns The generated text response
 */
export async function generateGeminiText(
  prompt: string,
  model = 'gemini-2.0-flash-lite'
): Promise<string> {
  try {
    const { text } = await generateText({
      model: google(model as 'gemini-2.0-flash-lite'),
      prompt: prompt,
    });

    return text;
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw new Error(
      `Failed to generate text: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parse a Gemini response with specific score and analysis fields
 *
 * @param response - The raw text response from Gemini
 * @returns Object with score, analysis text, and other extracted match information
 */
export function parseGeminiMatchResponse(response: string): {
  score: number;
  analysis: string;
  topMatches?: string[];
  missingSkills?: string[];
  enhancedExperience?: {
    years: number;
    companies: string[];
  };
  enhancedEducation?: Array<{
    degree: string;
    institution: string;
  }>;
} {
  // Extract score (assuming format "Score: XX")
  const scoreMatch = response.match(/Score:\s*(\d+)/i);
  let score = 0;
  if (scoreMatch && scoreMatch[1]) {
    score = parseInt(scoreMatch[1], 10);
    // Ensure score is between 0 and 100
    score = Math.min(100, Math.max(0, score));
  }

  // Extract analysis (assuming format "Analysis: text...")
  const analysisMatch = response.match(/Analysis:\s*([\s\S]+?)(?:\n\n|$)/i);
  let analysis = '';
  if (analysisMatch && analysisMatch[1]) {
    analysis = analysisMatch[1].trim();
  } else {
    // If no clear format, use the whole response
    analysis = response.trim();
  }

  // Extract any top matching skills if listed in response
  const topMatches: string[] = [];
  const matchingSkillsSection = response.match(
    /(?:Top|Key|Matching) Skills?:?\s*([\s\S]+?)(?:\n\n|$)/i
  );
  if (matchingSkillsSection && matchingSkillsSection[1]) {
    // Extract skills from a list format (could be comma-separated or bullet points)
    const skillText = matchingSkillsSection[1].trim();
    const skills = skillText
      .split(/,|\n|•/)
      .map((skill) => skill.trim())
      .filter(Boolean);
    topMatches.push(...skills);
  }

  // Extract any missing skills if listed in response
  const missingSkills: string[] = [];
  const missingSkillsSection = response.match(
    /(?:Missing|Gap|Lacking) Skills?:?\s*([\s\S]+?)(?:\n\n|$)/i
  );
  if (missingSkillsSection && missingSkillsSection[1]) {
    const skillText = missingSkillsSection[1].trim();
    const skills = skillText
      .split(/,|\n|•/)
      .map((skill) => skill.trim())
      .filter(Boolean);
    missingSkills.push(...skills);
  }

  // Extract enhanced experience information
  const enhancedExperience: { years: number; companies: string[] } = {
    years: 0,
    companies: [],
  };
  const experienceSection = response.match(/Experience:\s*([\s\S]+?)(?:\n\n|$)/i);
  if (experienceSection && experienceSection[1]) {
    // Try to extract years of experience
    const yearsMatch = experienceSection[1].match(/(\d+)\s*(?:years?|yrs?)/i);
    if (yearsMatch) {
      enhancedExperience.years = parseInt(yearsMatch[1], 10);
    }

    // Try to extract company names
    const companies = experienceSection[1]
      .split(/[,;]|\n/)
      .map((part) => {
        // Look for company names that are capitalized and followed by common identifiers
        const companyMatch = part.match(
          /([A-Z][A-Za-z0-9\s\.\-&]+?)(?:\s+(?:as|at|where|from|until|to|\(|\)|-))/
        );
        return companyMatch ? companyMatch[1].trim() : null;
      })
      .filter(
        (company): company is string =>
          company !== null &&
          company.length > 2 &&
          !company.match(
            /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Experience|Education)$/i
          )
      );

    enhancedExperience.companies = [...new Set(companies)]; // Remove duplicates
  }

  // Extract enhanced education information
  const enhancedEducation: Array<{ degree: string; institution: string }> = [];
  const educationSection = response.match(/Education:\s*([\s\S]+?)(?:\n\n|$)/i);
  if (educationSection && educationSection[1]) {
    const educationText = educationSection[1];

    // Split by common delimiters and process each education entry
    const entries = educationText.split(/[;]|\n/).filter(Boolean);
    for (const entry of entries) {
      // Look for patterns like "Degree from Institution" or "Institution - Degree"
      const match1 = entry.match(/([^,]+?)(?:from|at|in)\s+([A-Z][A-Za-z0-9\s\.\-&,]+)/i);
      const match2 = entry.match(/([A-Z][A-Za-z0-9\s\.\-&,]+?)[:\-]\s*([^,]+)/i);

      if (match1) {
        enhancedEducation.push({
          degree: match1[1].trim(),
          institution: match1[2].trim(),
        });
      } else if (match2) {
        enhancedEducation.push({
          institution: match2[1].trim(),
          degree: match2[2].trim(),
        });
      }
    }
  }

  return {
    score,
    analysis,
    topMatches: topMatches.length > 0 ? topMatches : undefined,
    missingSkills: missingSkills.length > 0 ? missingSkills : undefined,
    enhancedExperience:
      enhancedExperience.years > 0 || enhancedExperience.companies.length > 0
        ? enhancedExperience
        : undefined,
    enhancedEducation: enhancedEducation.length > 0 ? enhancedEducation : undefined,
  };
}
