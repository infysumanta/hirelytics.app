import mongoose, { Document, Schema } from 'mongoose';

import { InterviewState, InterviewStateSchema } from './interview-state';

export interface ParsedResume {
  extractedText: string;
  about: string;
  skills: string[];
  experience: {
    years: number;
    companies: string[];
  };
  education: {
    degree: string;
    institution: string;
  }[];
  analyzedAt: Date;
  // Match-specific fields
  matchScore?: number; // 0-100 score indicating compatibility with job
  aiComments?: string; // AI-generated analysis of the match
  matchedAt?: Date; // When the match was performed

  // For future expansion
  topSkillMatches?: string[]; // Skills that matched job requirements
  missingSkills?: string[]; // Important skills from job that candidate lacks
}

interface MonitoringImage {
  s3Key: string;
  timestamp: Date;
}

// Interface for interview chat messages
interface InterviewMessage {
  text: string;
  sender: 'ai' | 'user' | 'system';
  timestamp: Date;
  questionId?: string; // Optional field to link messages to specific questions
  questionCategory?: string; // Technical, project, or behavioral
  feedback?: string; // AI feedback on a user's answer
  audioS3Key?: string; // S3 key for the audio file of AI response
  audioS3Bucket?: string; // S3 bucket containing the audio file
  audioUrl?: string; // Direct URL to the audio file for immediate playback
}

export interface IJobApplication extends Document {
  jobId: string;
  userId: string; // User ID reference
  candidateName?: string; // Optional
  email?: string; // Optional
  resumeUrl: string;
  resumeBase64: string;
  fileName: string;
  s3Key?: string; // S3 object key for generating signed URLs
  s3Bucket?: string; // S3 bucket name for generating signed URLs
  preferredLanguage: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  parsedResume?: ParsedResume; // Parsed resume data including match score and AI comments
  interviewState?: InterviewState; // Track the state of the interview process
  monitoringEnabled?: boolean; // Whether camera monitoring is enabled
  monitoringInterval?: number; // Interval in milliseconds between captures
  monitoringImages?: MonitoringImage[]; // Array of captured monitoring images
  interviewChatHistory?: InterviewMessage[]; // Chat history from interview sessions
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    candidateName: String,
    email: String,
    resumeUrl: {
      type: String,
      required: [true, 'Resume URL is required'],
    },
    resumeBase64: {
      type: String,
      required: [true, 'Resume base64 content is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    s3Key: String,
    s3Bucket: String,
    preferredLanguage: {
      type: String,
      required: [true, 'Preferred language is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
    parsedResume: {
      extractedText: String,
      about: String,
      skills: [String],
      experience: {
        years: Number,
        companies: [String],
      },
      education: [
        {
          degree: String,
          institution: String,
        },
      ],
      analyzedAt: Date,
      matchScore: Number,
      aiComments: String,
      matchedAt: Date,
      topSkillMatches: [String],
      missingSkills: [String],
    },
    monitoringEnabled: {
      type: Boolean,
      default: false,
    },
    monitoringInterval: {
      type: Number,
      default: 30000, // Default 30 seconds
    },
    monitoringImages: [
      {
        s3Key: String,
        timestamp: Date,
      },
    ],
    interviewChatHistory: [
      {
        text: String,
        sender: {
          type: String,
          enum: ['ai', 'user', 'system'],
        },
        timestamp: Date,
        questionId: String,
        questionCategory: String,
        feedback: String,
        audioS3Key: String, // S3 key for the audio file of AI response
        audioS3Bucket: String, // S3 bucket containing the audio file
      },
    ],
    interviewState: InterviewStateSchema,
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate exports with NextJS hot reloading
export const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
