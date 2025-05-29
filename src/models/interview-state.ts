import { Schema } from 'mongoose';

// Represents the state of an interview process
export interface InterviewState {
  currentPhase: string; // Based on InterviewPhase enum
  technicalQuestionsAsked: number; // Track number of technical questions asked (out of 3)
  projectQuestionsAsked: number; // Track number of project questions asked (out of 3)
  behavioralQuestionsAsked: number; // Track number of behavioral questions asked (out of 3)
  lastQuestion?: string; // The last question asked
  askedQuestions: {
    id: string;
    question: string;
    category: string;
  }[];
  feedback: {
    technicalSkills?: number; // 1-5 rating
    communicationSkills?: number; // 1-5 rating
    problemSolving?: number; // 1-5 rating
    cultureFit?: number; // 1-5 rating
    overallImpression?: string;
    strengths?: string[];
    areasOfImprovement?: string[];
  };
  completedAt?: Date;
  // Timer-related fields
  timerStartedAt?: Date; // When the interview timer started
  timerDurationMinutes?: number; // Interview duration in minutes
  isTimerExpired?: boolean; // Whether the timer has expired
  interruptedAt?: Date; // When the interview was interrupted (if applicable)
  interruptionReason?: 'timer_expired' | 'technical_issue' | 'user_action'; // Reason for interruption
}

// Define the schema for interview state
export const InterviewStateSchema = new Schema(
  {
    currentPhase: {
      type: String,
      enum: [
        'introduction',
        'candidate_introduction',
        'technical_questions',
        'project_discussion',
        'behavioral_questions',
        'conclusion',
        'completed',
        'interrupted',
      ],
      default: 'introduction',
    },
    technicalQuestionsAsked: {
      type: Number,
      default: 0,
    },
    projectQuestionsAsked: {
      type: Number,
      default: 0,
    },
    behavioralQuestionsAsked: {
      type: Number,
      default: 0,
    },
    lastQuestion: {
      type: String,
    },
    askedQuestions: [
      {
        id: String,
        question: String,
        category: String,
      },
    ],
    feedback: {
      technicalSkills: Number,
      communicationSkills: Number,
      problemSolving: Number,
      cultureFit: Number,
      overallImpression: String,
      strengths: [String],
      areasOfImprovement: [String],
    },
    completedAt: Date,
    // Timer-related fields
    timerStartedAt: Date,
    timerDurationMinutes: Number,
    isTimerExpired: {
      type: Boolean,
      default: false,
    },
    interruptedAt: Date,
    interruptionReason: {
      type: String,
      enum: ['timer_expired', 'technical_issue', 'user_action'],
    },
  },
  { _id: false }
);
