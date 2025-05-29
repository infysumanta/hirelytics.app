import mongoose, { Document, Model, Schema } from 'mongoose';

import { IUser } from './user';

export interface IJob extends Document {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  expiryDate: Date;
  location: string;
  salary?: string;
  skills: string[];
  requirements?: string;
  benefits?: string;
  urlId: string;
  recruiter: mongoose.Types.ObjectId | IUser;
  isActive: boolean;
  interviewDuration: number; // Interview duration in minutes
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    companyName: {
      type: String,
      required: [true, 'Please provide a company name'],
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide an expiry date'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
    },
    salary: {
      type: String,
    },
    skills: {
      type: [String],
      required: [true, 'Please provide at least one skill'],
    },
    requirements: {
      type: String,
    },
    benefits: {
      type: String,
    },
    urlId: {
      type: String,
      required: true,
      unique: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    interviewDuration: {
      type: Number,
      required: [true, 'Interview duration is required'],
      min: [5, 'Interview duration must be at least 5 minutes'],
      max: [120, 'Interview duration cannot exceed 120 minutes'],
    },
  },
  { timestamps: true }
);

// Only define the model in a Node.js environment, not in Edge runtime
const Job: Model<IJob> =
  mongoose.models.Job ||
  (typeof window === 'undefined' && typeof global !== 'undefined' && !('EdgeRuntime' in global)
    ? mongoose.model<IJob>('Job', JobSchema)
    : (null as unknown as Model<IJob>));

export default Job;
