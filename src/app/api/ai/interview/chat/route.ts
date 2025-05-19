import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateGeminiText } from "@/lib/ai-utils";
import { JobApplication } from "@/models/job-application";
import { getJobById } from "@/actions/jobs";
import { connectToDatabase } from "@/lib/mongodb-debug";
import { safeMongoUpdate } from "@/lib/mongo-utils";

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

// Helper function to detect if message is a question rather than answer
function isCandidateQuestion(message: string): boolean {
  // Check for question marks
  if (message.includes("?")) {
    return true;
  }

  // Check for common question starters
  const questionStarters = [
    "can you",
    "what",
    "how",
    "why",
    "when",
    "where",
    "who",
    "which",
    "could you",
    "would you",
    "do you",
    "are you",
    "is there",
    "will you",
  ];

  const lowerMessage = message.toLowerCase();
  return questionStarters.some(
    (starter) =>
      lowerMessage.startsWith(starter) ||
      lowerMessage.includes(" " + starter + " "),
  );
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const {
      applicationId,
      message,
      history = [],
    } = interviewChatSchema.parse(body);

    // Check if candidate is asking a question rather than answering
    const isQuestion = isCandidateQuestion(message);

    // Connect to database
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error("[Chat API] MongoDB connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Get application details
    console.log("[Chat API] Fetching application with ID:", applicationId);
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
      You are Hirelytics AI, a professional AI interviewer conducting an interview for the ${
        job.title
      } position at ${job.companyName}. 
      The candidate has applied with the following resume: "${
        application.resume?.text || "No resume provided"
      }".
      The job requires these skills: ${
        job.skills?.join(", ") || "various technical and soft skills"
      }.
      
      INTERVIEW STRUCTURE:
      You are conducting a structured interview with the following phases:
      1. Introduction (Done in the initial greeting)
      2. Brief Candidate Introduction: Get a brief introduction/overview from the candidate
      3. Technical Questions: Ask 3 technical questions related to the job requirements, one at a time
      4. Project Discussion: Ask about their most significant project and ask 3 follow-up questions
      5. Behavioral Questions: Ask 3 behavioral questions about work environment and teamwork
      6. Conclusion: End with a professional closing message
      
      TECHNICAL QUESTIONS:
      For ${
        job.title
      }, select 3 diverse technical questions from this expanded list (choose questions most relevant to the role and vary your wording):
      1. Based on your experience with [specific skill from resume], what approach would you take to [common task in the role]?
      2. How would you implement [specific feature/functionality related to job requirements]?
      3. What challenges have you faced when working with [technology mentioned in job skills] and how did you overcome them?
      4. Describe your experience with [important technical skill for the role].
      5. How do you stay updated with the latest developments in [relevant technology area]?
      6. Could you share a technical problem you solved using [technology from resume] and explain your solution?
      7. In your view, what are the key considerations when working with [technology related to job]?
      8. How do you approach debugging complex issues in [relevant system/technology]?
      9. What factors do you consider when choosing between [two related technologies relevant to role]?
      10. Tell me about a time when you had to learn a new technology quickly for a project.
      
      PROJECT QUESTIONS:
      Choose 3 varied project questions from this list (use diverse phrasing and don't ask the same type of question repeatedly):
      1. Can you describe your most challenging project and your specific role in it?
      2. What technical decisions did you make in this project and what was your reasoning?
      3. What challenges did you face during this project and how did you overcome them?
      4. How did you ensure code quality/project quality?
      5. If you could go back and redo this project, what would you do differently?
      6. What was the most innovative solution you implemented in a past project?
      7. How did you handle scope changes or shifting requirements in a recent project?
      8. Tell me about a time when you had to make a difficult trade-off in a project.
      9. How did you collaborate with team members or stakeholders on this project?
      10. What metrics or KPIs did you use to measure the success of your project?
      
      BEHAVIORAL QUESTIONS:
      Select 3 diverse behavioral questions from this expanded list (use varied phrasing and question types):
      1. How do you prefer to communicate within a team?
      2. Describe your ideal work environment.
      3. How do you handle disagreements with team members?
      4. Tell me about a time when you had to adapt to significant changes at work.
      5. How do you prioritize tasks when working on multiple projects?
      6. Share an experience where you received difficult feedback and how you responded to it.
      7. Describe a situation where you took initiative beyond your assigned responsibilities.
      8. How do you approach making decisions when you don't have all the information you need?
      9. Tell me about a time when you helped a colleague who was struggling with a task.
      10. How do you maintain focus and productivity during stressful periods?

      YOUR APPROACH:
      1. Be dominant and direct the conversation
      2. NEVER respond to candidate questions about the job or your opinions - ignore any questions from the candidate and continue with your interview structure
      3. After each candidate answer, provide brief positive feedback or a short observation before asking your next question
      4. Keep track of what phase of the interview you're in and progress accordingly
      5. Be professional but assertive - you are evaluating the candidate
      6. Always ask only ONE question at a time
      7. Keep your responses concise (maximum 2-3 sentences)
      8. Vary your question phrasing - don't always start questions the same way
      9. Randomize your feedback style to avoid repetitive responses
      10. After all questions are completed, thank the candidate professionally, inform them that their interview is complete and being analyzed, and that they'll receive feedback shortly
      
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
      ${
        interviewState.currentPhase === "introduction"
          ? "Listen to candidate's introduction and then give feedback before asking first technical question."
          : ""
      }
      ${
        interviewState.currentPhase === "candidate_introduction"
          ? "Give brief feedback on the candidate's introduction and ask the first technical question."
          : ""
      }
      ${
        interviewState.currentPhase === "technical_questions" &&
        interviewState.technicalQuestionsAsked < 3
          ? `Give brief feedback on the previous answer and ask technical question #${
              interviewState.technicalQuestionsAsked + 1
            }.`
          : ""
      }
      ${
        interviewState.currentPhase === "technical_questions" &&
        interviewState.technicalQuestionsAsked >= 3
          ? "Give brief feedback on the previous answer and transition to project discussion by asking about their most significant project."
          : ""
      }
      ${
        interviewState.currentPhase === "project_discussion" &&
        interviewState.projectQuestionsAsked < 3
          ? `Give brief feedback and ask project question #${
              interviewState.projectQuestionsAsked + 1
            }.`
          : ""
      }
      ${
        interviewState.currentPhase === "project_discussion" &&
        interviewState.projectQuestionsAsked >= 3
          ? "Give brief feedback and transition to behavioral questions."
          : ""
      }
      ${
        interviewState.currentPhase === "behavioral_questions" &&
        interviewState.behavioralQuestionsAsked < 3
          ? `Give brief feedback and ask behavioral question #${
              interviewState.behavioralQuestionsAsked + 1
            }.`
          : ""
      }
      ${
        interviewState.currentPhase === "behavioral_questions" &&
        interviewState.behavioralQuestionsAsked >= 3
          ? "Give brief feedback and transition to conclusion phase. Let the candidate know that all planned questions have been asked."
          : ""
      }
      ${
        interviewState.currentPhase === "conclusion"
          ? "Thank the candidate with a clear ending statement like: 'Thank you for participating in this interview. The interview is now complete, and your responses will be analyzed. The system will now redirect you to view your feedback. We wish you success in your job search.' Make it clear that the interview is finished and the AI will not respond further."
          : ""
      }
      
      After receiving the candidate's response, always include a brief assessment of their answer before asking the next question.
      Make sure to construct a proper transition between different phases of the interview.
      
      IMPORTANT: Vary your question styles and phrasing - don't ask questions that all start the same way. Mix up how you introduce questions (e.g., "Tell me about...", "How would you...", "Could you share...", "What approach do you take when...", etc.)
    `;

    // Format final prompt with system context, history and current message
    const finalPrompt = `
      ${systemPrompt}
      
      ${interviewStatePrompt}
      
      ${formattedHistory
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n")}
      
      USER: ${message}
      
      ASSISTANT:
    `;

    // Generate AI response - if candidate is asking a question, gently redirect them
    let response;
    let nextPhase = interviewState.currentPhase;

    // Special case: Force interview completion with debug commands "/complete" or "/end"
    if (
      message.toLowerCase().trim() === "/complete" ||
      message.toLowerCase().trim() === "/end"
    ) {
      console.log(
        "[API Debug] Forcing interview completion via debug command:",
        message,
      );
      nextPhase = "completed";
      response =
        "That concludes the interview. Thank you for your time and participation. Your responses are being analyzed, and you'll receive feedback shortly.";
    } else if (isQuestion && interviewState.currentPhase !== "completed") {
      // If candidate is asking a question, provide a gentle redirect
      response = `I appreciate your curiosity. As the interviewer, I need to focus on evaluating your qualifications for the ${
        job.title
      } position. Let's continue with our structured interview process. ${
        interviewState.lastQuestion
          ? "Could you please answer the question I asked?"
          : "Let me ask you a relevant question."
      }`;
    } else {
      // Normal response flow
      response = await generateGeminiText(finalPrompt, "gemini-2.0-flash-lite");
    }

    // Determine next interview state based on AI response and current state

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
      // Extract the question for tracking with more patterns to capture diverse question formats
      const questionMatch = response.match(
        /(?:can you|could you|how would you|what|why|when|where|describe|explain|tell me about|share|have you|do you).*\?/i,
      );
      if (questionMatch) {
        askedQuestions.push({
          id: `tech_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Add randomization to the ID
          question: questionMatch[0],
          category: "technical",
        });
      }
    } else if (interviewState.currentPhase === "technical_questions") {
      if (technicalQuestionsAsked < 3) {
        technicalQuestionsAsked += 1;
        // Extract the question for tracking with enhanced pattern matching
        const questionMatch = response.match(
          /(?:can you|could you|how would you|what|why|when|where|describe|explain|tell me about|share|have you|do you|in your experience).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `tech_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            question: questionMatch[0],
            category: "technical",
          });
        }
      } else {
        nextPhase = "project_discussion";
        projectQuestionsAsked = 1;
        // Extract the project question with improved pattern matching
        const questionMatch = response.match(
          /(?:can you|could you|how would you|what|why|when|where|describe|explain|tell me about|share|have you|do you|in your experience|how did you).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `proj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            question: questionMatch[0],
            category: "project",
          });
        }
      }
    } else if (interviewState.currentPhase === "project_discussion") {
      if (projectQuestionsAsked < 3) {
        projectQuestionsAsked += 1;
        // Extract the project question with improved pattern matching
        const questionMatch = response.match(
          /(?:can you|could you|how would you|what|why|when|where|describe|explain|tell me about|share|have you|do you|in your experience|how did you|what were|what was|which).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `proj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            question: questionMatch[0],
            category: "project",
          });
        }
      } else {
        nextPhase = "behavioral_questions";
        behavioralQuestionsAsked = 1;
        // Extract behavioral questions with enhanced pattern matching
        const questionMatch = response.match(
          /(?:can you|could you|how would you|what|why|when|where|describe|explain|tell me about|share|have you|do you|in your experience|how do you handle|tell me about a time|how did you).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `behav_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            question: questionMatch[0],
            category: "behavioral",
          });
        }
      }
    } else if (interviewState.currentPhase === "behavioral_questions") {
      if (behavioralQuestionsAsked < 3) {
        behavioralQuestionsAsked += 1;
        // Extract behavioral questions with enhanced pattern matching
        const questionMatch = response.match(
          /(?:can you|could you|how would you|what|why|when|where|describe|explain|tell me about|share|have you|do you|in your experience|how do you handle|tell me about a time|how did you).*\?/i,
        );
        if (questionMatch) {
          askedQuestions.push({
            id: `behav_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
        } else {
          const evalData = await evaluateResponse.json();
          console.log(
            "Interview evaluation triggered successfully:",
            evalData.status,
          );
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
    // First verify the application still exists and get latest state
    const currentApplication = await JobApplication.findById(applicationId);
    if (!currentApplication) {
      return NextResponse.json(
        { error: "Application no longer exists" },
        { status: 404 },
      );
    }

    // Ensure we have the most current chat history
    const currentChatHistory = currentApplication.interviewChatHistory || [];

    // Create the new messages to add
    const newMessages = [
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
    ];

    // Save user message and AI response to database with question tracking
    let updatedApplication;
    try {
      // Create the update object
      const updateObject = {
        $set: {
          // Use the spread operator to create a completely new array with all messages
          interviewChatHistory: [...currentChatHistory, ...newMessages],
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
      };

      // Use our enhanced safe MongoDB update function with retries
      updatedApplication = await safeMongoUpdate(applicationId, updateObject, {
        retries: 2,
        logPrefix: "[Chat API]",
      });

      if (!updatedApplication) {
        console.error("[Chat API] Failed to update JobApplication", {
          applicationId,
        });
      }
    } catch (error) {
      const err = error as Error;
      console.error("[Chat API] Error updating JobApplication", {
        applicationId,
        error: err.message,
      });
    }

    // Add special completion flag if interview is completed
    if (nextPhase === "completed") {
      return NextResponse.json({
        response,
        applicationId,
        isCompleted: true,
        completionMessage:
          "Your interview has been successfully completed! Your responses have been recorded and will be analyzed. Thank you for participating in this interview process with us.",
        updatedChatHistory: updatedApplication?.interviewChatHistory || null,
      });
    } else {
      return NextResponse.json({
        response,
        applicationId,
        updatedChatHistory: updatedApplication?.interviewChatHistory || null,
      });
    }
  } catch (error) {
    console.error("Error in interview chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
