import mongoose, { Document, Schema } from "mongoose";

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
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate exports with NextJS hot reloading
export const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
