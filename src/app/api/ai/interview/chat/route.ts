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
      
      INTERVIEW STRUCTURE:
      You are conducting a structured interview with the following phases:
      1. Introduction (Done in the initial greeting)
      2. Brief Candidate Introduction: Get a brief introduction/overview from the candidate
      3. Technical Questions: Ask 3 technical questions related to the job requirements, one at a time
      4. Project Discussion: Ask about their most significant project and ask 3 follow-up questions
      5. Behavioral Questions: Ask 3 behavioral questions about work environment and teamwork
      6. Conclusion: End with a professional closing message
      
      TECHNICAL QUESTIONS:
      For ${job.title}, ask 3 of these technical questions (select ones most relevant to the role):
      1. Based on your experience with [specific skill from resume], what approach would you take to [common task in the role]?
      2. How would you implement [specific feature/functionality related to job requirements]?
      3. What challenges have you faced when working with [technology mentioned in job skills] and how did you overcome them?
      4. Describe your experience with [important technical skill for the role].
      5. How do you stay updated with the latest developments in [relevant technology area]?
      
      PROJECT QUESTIONS:
      1. Can you describe your most challenging project and your specific role in it?
      2. What technical decisions did you make in this project and what was your reasoning?
      3. What challenges did you face during this project and how did you overcome them?
      4. How did you ensure code quality/project quality?
      5. If you could go back and redo this project, what would you do differently?
      
      BEHAVIORAL QUESTIONS:
      1. How do you prefer to communicate within a team?
      2. Describe your ideal work environment.
      3. How do you handle disagreements with team members?
      4. Tell me about a time when you had to adapt to significant changes at work.
      5. How do you prioritize tasks when working on multiple projects?

      YOUR APPROACH:
      1. Be dominant and direct the conversation - don't ask "Do you have any questions for me?"
      2. After each candidate answer, provide brief positive feedback or a short observation before asking your next question
      3. Keep track of what phase of the interview you're in and progress accordingly
      4. Be professional but assertive - you are evaluating the candidate
      5. Always ask only ONE question at a time
      6. Keep your responses concise (maximum 2-3 sentences)
      7. After all questions are completed, thank the candidate and end the interview professionally
      
      Current conversation context: The interview is in progress.
    `;

    // Convert history to proper format for Gemini
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get the current interview state
    const interviewState = application.interviewState || {
      currentPhase: "introduction",
      technicalQuestionsAsked: 0,
      projectQuestionsAsked: 0,
      behavioralQuestionsAsked: 0,
      askedQuestions: [],
    };

    // Append the current interview state to the prompt
    const interviewStatePrompt = `
      CURRENT INTERVIEW STATE:
      Phase: ${interviewState.currentPhase}
      Technical questions asked: ${interviewState.technicalQuestionsAsked}/3
      Project questions asked: ${interviewState.projectQuestionsAsked}/3
      Behavioral questions asked: ${interviewState.behavioralQuestionsAsked}/3
      
      Your next action:
      ${interviewState.currentPhase === "introduction" ? "Listen to candidate's introduction and then give feedback before asking first technical question." : ""}
      ${interviewState.currentPhase === "candidate_introduction" ? "Give brief feedback on the candidate's introduction and ask the first technical question." : ""}
      ${interviewState.currentPhase === "technical_questions" && interviewState.technicalQuestionsAsked < 3 ? `Give brief feedback on the previous answer and ask technical question #${interviewState.technicalQuestionsAsked + 1}.` : ""}
      ${interviewState.currentPhase === "technical_questions" && interviewState.technicalQuestionsAsked >= 3 ? "Give brief feedback on the previous answer and transition to project discussion by asking about their most significant project." : ""}
      ${interviewState.currentPhase === "project_discussion" && interviewState.projectQuestionsAsked < 3 ? `Give brief feedback and ask project question #${interviewState.projectQuestionsAsked + 1}.` : ""}
      ${interviewState.currentPhase === "project_discussion" && interviewState.projectQuestionsAsked >= 3 ? "Give brief feedback and transition to behavioral questions." : ""}
      ${interviewState.currentPhase === "behavioral_questions" && interviewState.behavioralQuestionsAsked < 3 ? `Give brief feedback and ask behavioral question #${interviewState.behavioralQuestionsAsked + 1}.` : ""}
      ${interviewState.currentPhase === "behavioral_questions" && interviewState.behavioralQuestionsAsked >= 3 ? "Give brief feedback and transition to conclusion phase. Let the candidate know that all planned questions have been asked." : ""}
      ${interviewState.currentPhase === "conclusion" ? "Thank the candidate professionally for their time, mention that their responses will be evaluated, and wish them success in their job search. Do NOT ask if they have any questions for you." : ""}
      
      After receiving the candidate's response, always include a brief assessment of their answer before asking the next question.
      Make sure to construct a proper transition between different phases of the interview.
    `;

    // Format final prompt with system context, history and current message
    const finalPrompt = `
      ${systemPrompt}
      
      ${interviewStatePrompt}
      
      ${formattedHistory.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")}
      
      USER: ${message}
      
      ASSISTANT:
    `;

    // Generate AI response
    const response = await generateGeminiText(
      finalPrompt,
      "gemini-2.0-flash-lite",
    );

    // Determine next interview state based on AI response and current state
    let nextPhase = interviewState.currentPhase;
    let technicalQuestionsAsked = interviewState.technicalQuestionsAsked;
    let projectQuestionsAsked = interviewState.projectQuestionsAsked;
    let behavioralQuestionsAsked = interviewState.behavioralQuestionsAsked;
    const askedQuestions = [...(interviewState.askedQuestions || [])];

    // The AI's response indicates the phase transition
    if (interviewState.currentPhase === "introduction") {
      nextPhase = "candidate_introduction";
    } else if (interviewState.currentPhase === "candidate_introduction") {
      nextPhase = "technical_questions";
      technicalQuestionsAsked = 1;
      // Extract the question for tracking
      const questionMatch = response.match(
        /(?:can you|how would you|what|describe|explain|tell me about).*\?/i,
      );
      if (questionMatch) {
        askedQuestions.push({
          id: `tech_${Date.now()}`,
          question: questionMatch[0],
          category: "technical",
        });
      }
    } else if (interviewState.currentPhase === "technical_questions") {
      if (technicalQuestionsAsked < 3) {
        technicalQuestionsAsked += 1;
        // Extract the question for tracking
        const questionMatch = response.match(
          /(?:can you|how would you|what|describe|explain|tell me about).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `tech_${Date.now()}`,
            question: questionMatch[0],
            category: "technical",
          });
        }
      } else {
        nextPhase = "project_discussion";
        projectQuestionsAsked = 1;
        // Extract the question for tracking
        const questionMatch = response.match(
          /(?:can you|how would you|what|describe|explain|tell me about).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `proj_${Date.now()}`,
            question: questionMatch[0],
            category: "project",
          });
        }
      }
    } else if (interviewState.currentPhase === "project_discussion") {
      if (projectQuestionsAsked < 3) {
        projectQuestionsAsked += 1;
        // Extract the question for tracking
        const questionMatch = response.match(
          /(?:can you|how would you|what|describe|explain|tell me about).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `proj_${Date.now()}`,
            question: questionMatch[0],
            category: "project",
          });
        }
      } else {
        nextPhase = "behavioral_questions";
        behavioralQuestionsAsked = 1;
        // Extract the question for tracking
        const questionMatch = response.match(
          /(?:can you|how would you|what|describe|explain|tell me about).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `behav_${Date.now()}`,
            question: questionMatch[0],
            category: "behavioral",
          });
        }
      }
    } else if (interviewState.currentPhase === "behavioral_questions") {
      if (behavioralQuestionsAsked < 3) {
        behavioralQuestionsAsked += 1;
        // Extract the question for tracking
        const questionMatch = response.match(
          /(?:can you|how would you|what|describe|explain|tell me about).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `behav_${Date.now()}`,
            question: questionMatch[0],
            category: "behavioral",
          });
        }
      } else {
        nextPhase = "conclusion";
      }
    } else if (interviewState.currentPhase === "conclusion") {
      nextPhase = "completed";

      // Automatically trigger interview evaluation
      try {
        // Make a call to the evaluate endpoint
        const evaluateResponse = await fetch(
          new URL(`/api/ai/interview/evaluate`, req.url).toString(),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ applicationId }),
          },
        );

        if (!evaluateResponse.ok) {
          console.error("Failed to automatically evaluate interview");
        }
      } catch (evalError) {
        console.error(
          "Error triggering automatic interview evaluation:",
          evalError,
        );
      }
    }

    // Extract feedback from AI response (first sentence typically)
    const feedbackMatch = response.split(/[.!?]/)[0];
    const feedback = feedbackMatch ? feedbackMatch.trim() : "";

    // Get current question from tracked questions if available
    const currentQuestion =
      askedQuestions.length > 0
        ? askedQuestions[askedQuestions.length - 1]
        : undefined;

    // Save user message and AI response to database with question tracking
    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $push: {
          interviewChatHistory: [
            {
              text: message,
              sender: "user",
              timestamp: new Date(),
              questionId: interviewState.lastQuestion || undefined,
              questionCategory: currentQuestion?.category,
            },
            {
              text: response,
              sender: "ai",
              timestamp: new Date(),
              questionId: currentQuestion?.id,
              questionCategory: currentQuestion?.category,
              feedback: feedback,
            },
          ],
        },
        $set: {
          interviewState: {
            currentPhase: nextPhase,
            technicalQuestionsAsked,
            projectQuestionsAsked,
            behavioralQuestionsAsked,
            lastQuestion: currentQuestion?.id,
            askedQuestions,
            completedAt: nextPhase === "completed" ? new Date() : undefined,
          },
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
