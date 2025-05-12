import mongoose, { Document, Schema } from "mongoose";

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
  status: "pending" | "reviewed" | "accepted" | "rejected";
  parsedResume?: ParsedResume; // Parsed resume data including match score and AI comments
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema(
  {
    jobId: {
      type: String,
      required: [true, "Job ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    resumeUrl: {
      type: String,
      required: [true, "Resume URL is required"],
    },
    resumeBase64: {
      type: String,
      required: [true, "Resume base64 data is required"],
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    s3Key: {
      type: String,
      // Optional but useful for generating signed URLs
    },
    s3Bucket: {
      type: String,
      // Optional but useful for generating signed URLs
    },
    preferredLanguage: {
      type: String,
      required: [true, "Preferred language is required"],
      default: "en",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    parsedResume: {
      extractedText: String,
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
      // Match-specific fields with improved schema
      matchScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      aiComments: String,
      matchedAt: Date,
      // Additional match fields for future expansion
      topSkillMatches: [String],
      missingSkills: [String],
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate exports with NextJS hot reloading
export const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
