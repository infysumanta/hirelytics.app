import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Generates text using Google's Gemini model via Vercel AI SDK
 *
 * @param prompt - The prompt to send to the model
 * @param model - The specific Gemini model to use (defaults to gemini-2.0-flash-lite)
 * @returns The generated text response
 */
export async function generateGeminiText(
  prompt: string,
  model = "gemini-2.0-flash-lite",
): Promise<string> {
  try {
    const { text } = await generateText({
      model: google(
        model as "gemini-2.0-flash-lite" | "gemini-1.5-pro" | "gemini-1.0-pro",
      ),
      prompt: prompt,
    });

    return text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw new Error(
      `Failed to generate text: ${error instanceof Error ? error.message : String(error)}`,
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
  let analysis = "";
  if (analysisMatch && analysisMatch[1]) {
    analysis = analysisMatch[1].trim();
  } else {
    // If no clear format, use the whole response
    analysis = response.trim();
  }

  // Extract any top matching skills if listed in response
  const topMatches: string[] = [];
  const matchingSkillsSection = response.match(
    /(?:Top|Key|Matching) Skills?:?\s*([\s\S]+?)(?:\n\n|$)/i,
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
    /(?:Missing|Gap|Lacking) Skills?:?\s*([\s\S]+?)(?:\n\n|$)/i,
  );
  if (missingSkillsSection && missingSkillsSection[1]) {
    const skillText = missingSkillsSection[1].trim();
    const skills = skillText
      .split(/,|\n|•/)
      .map((skill) => skill.trim())
      .filter(Boolean);
    missingSkills.push(...skills);
  }

  return {
    score,
    analysis,
    topMatches: topMatches.length > 0 ? topMatches : undefined,
    missingSkills: missingSkills.length > 0 ? missingSkills : undefined,
  };
}
