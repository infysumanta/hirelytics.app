// Interview question types organized by category for the AI interviewer
// These are used as a reference and can be modified by recruiters

export const TECHNICAL_QUESTIONS = [
  {
    id: "tech_1",
    question:
      "Based on your experience, what approach would you take to solve [specific technical challenge]?",
    category: "problem_solving",
  },
  {
    id: "tech_2",
    question:
      "How would you implement [specific feature/functionality] in this role?",
    category: "implementation",
  },
  {
    id: "tech_3",
    question:
      "What challenges have you faced when working with [technology] and how did you overcome them?",
    category: "challenges",
  },
  {
    id: "tech_4",
    question: "Describe your experience with [programming language/framework].",
    category: "experience",
  },
  {
    id: "tech_5",
    question:
      "How do you stay updated with the latest developments in [technology area]?",
    category: "continuous_learning",
  },
];

export const PROJECT_QUESTIONS = [
  {
    id: "proj_1",
    question:
      "Can you describe your most challenging project and your specific role in it?",
    category: "project_experience",
  },
  {
    id: "proj_2",
    question:
      "What technical decisions did you make in this project and what was your reasoning?",
    category: "decision_making",
  },
  {
    id: "proj_3",
    question:
      "What challenges did you face during this project and how did you overcome them?",
    category: "problem_solving",
  },
  {
    id: "proj_4",
    question:
      "How did you ensure code quality/project quality throughout the development process?",
    category: "quality_assurance",
  },
  {
    id: "proj_5",
    question:
      "If you could go back and redo this project, what would you do differently?",
    category: "reflection",
  },
];

export const BEHAVIORAL_QUESTIONS = [
  {
    id: "behav_1",
    question: "How do you prefer to communicate within a team?",
    category: "communication",
  },
  {
    id: "behav_2",
    question: "Describe your ideal work environment.",
    category: "work_environment",
  },
  {
    id: "behav_3",
    question: "How do you handle disagreements with team members?",
    category: "conflict_resolution",
  },
  {
    id: "behav_4",
    question:
      "Tell me about a time when you had to adapt to significant changes at work.",
    category: "adaptability",
  },
  {
    id: "behav_5",
    question: "How do you prioritize tasks when working on multiple projects?",
    category: "time_management",
  },
];

// Interview state tracking
export enum InterviewPhase {
  INTRODUCTION = "introduction",
  CANDIDATE_INTRO = "candidate_introduction",
  TECHNICAL_QUESTIONS = "technical_questions",
  PROJECT_DISCUSSION = "project_discussion",
  BEHAVIORAL_QUESTIONS = "behavioral_questions",
  CONCLUSION = "conclusion",
  COMPLETED = "completed",
}
