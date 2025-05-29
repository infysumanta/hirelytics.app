import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/job";
import { auth } from "@/auth";
import { z } from "zod";
import mongoose from "mongoose";
import User from "@/models/user";

// Helper function to check if user is a recruiter
async function isRecruiter() {
  const session = await auth();
  return session?.user?.role === "recruiter";
}

// Validation schema for update
const updateJobSchema = z.object({
  title: z.string().min(1, "Job title is required").optional(),
  description: z.string().min(1, "Job description is required").optional(),
  companyName: z.string().min(1, "Company name is required").optional(),
  expiryDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid expiry date",
    })
    .optional(),
  location: z.string().min(1, "Location is required").optional(),
  salary: z.string().optional(),
  skills: z
    .array(z.string())
    .min(1, "At least one skill is required")
    .optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  isActive: z.boolean().optional(),
  interviewDuration: z
    .number()
    .min(5, "Interview duration must be at least 5 minutes")
    .max(120, "Interview duration cannot exceed 120 minutes")
    .optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Connect to database
    await connectToDatabase();

    // Find job by ID or urlId
    let job;
    if (mongoose.Types.ObjectId.isValid(id)) {
      job = await Job.findById(id);
      // .populate("recruiter", "name email");
    } else {
      job = await Job.findOne({ urlId: id });
      // .populate(
      //   "recruiter",
      //   "name email",
      // );
    }

    const recruiter = await User.findOne({ _id: job?.recruiter });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Return job data
    return NextResponse.json({
      job: {
        id: job._id.toString(),
        title: job.title,
        description: job.description,
        companyName: job.companyName,
        expiryDate: job.expiryDate,
        location: job.location,
        salary: job.salary,
        skills: job.skills,
        requirements: job.requirements,
        benefits: job.benefits,
        urlId: job.urlId,
        isActive: job.isActive,
        interviewDuration: job.interviewDuration,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        recruiter: {
          id: recruiter?._id.toString(),
          name: recruiter?.name,
          email: recruiter?.email,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check if user is a recruiter
    if (!(await isRecruiter())) {
      return NextResponse.json(
        { error: "Unauthorized. Recruiter access required." },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    // Get the current user session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateJobSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    // Find job by ID
    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if the job belongs to the recruiter
    if (job.recruiter.toString() !== userId) {
      return NextResponse.json(
        { error: "You can only update your own jobs" },
        { status: 403 },
      );
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...validatedData };
    if (validatedData.expiryDate) {
      updateData.expiryDate = new Date(validatedData.expiryDate);
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    // Return updated job data
    return NextResponse.json({
      job: {
        id: updatedJob?._id.toString(),
        title: updatedJob?.title,
        companyName: updatedJob?.companyName,
        skills: updatedJob?.skills,
        expiryDate: updatedJob?.expiryDate,
        urlId: updatedJob?.urlId,
        isActive: updatedJob?.isActive,
      },
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("Error updating job:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check if user is a recruiter
    if (!(await isRecruiter())) {
      return NextResponse.json(
        { error: "Unauthorized. Recruiter access required." },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    // Get the current user session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find job by ID
    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if the job belongs to the recruiter
    if (job.recruiter.toString() !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own jobs" },
        { status: 403 },
      );
    }

    // Delete job
    await Job.findByIdAndDelete(id);

    // Return success response
    return NextResponse.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 },
    );
  }
}
