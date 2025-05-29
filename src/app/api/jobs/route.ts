import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/job';
// Import the User model to ensure its schema is registered

// Helper function to check if user is a recruiter
async function isRecruiter() {
  const session = await auth();
  return session?.user?.role === 'recruiter';
}

// Define query interface
interface JobQuery {
  recruiter?: string;
  $or?: Array<{
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }>;
}
// Define job creation schema for validation
const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(1, 'Job description is required'),
  companyName: z.string().min(1, 'Company name is required'),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid expiry date',
  }),
  location: z.string().min(1, 'Location is required'),
  salary: z.string().optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  interviewDuration: z
    .number()
    .min(5, 'Interview duration must be at least 5 minutes')
    .max(120, 'Interview duration cannot exceed 120 minutes'),
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is a recruiter
    if (!(await isRecruiter())) {
      return NextResponse.json(
        { error: 'Unauthorized. Recruiter access required.' },
        { status: 403 }
      );
    }

    // Get the current user session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createJobSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    // Generate a unique URL ID
    const urlId = uuidv4();

    // Create new job
    const job = await Job.create({
      ...validatedData,
      expiryDate: new Date(validatedData.expiryDate),
      urlId,
      recruiter: userId,
    });

    // Return success response
    return NextResponse.json(
      {
        job: {
          id: job._id.toString(),
          title: job.title,
          companyName: job.companyName,
          skills: job.skills,
          expiryDate: job.expiryDate,
          urlId: job.urlId,
        },
        message: 'Job created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Job creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is a recruiter
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build query
    const query: JobQuery = {};

    // If recruiter, only show their jobs
    if (userRole === 'recruiter') {
      query.recruiter = userId;
    }

    // Add search functionality if needed
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch jobs with pagination
    const skip = (page - 1) * limit;
    const jobs = await Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const totalJobs = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);

    // Return jobs
    return NextResponse.json({
      jobs,
      pagination: {
        totalJobs,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
