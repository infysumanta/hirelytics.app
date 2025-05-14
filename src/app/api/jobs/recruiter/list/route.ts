import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/job";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user?.role !== "recruiter") {
      return NextResponse.json(
        { error: "Unauthorized. Recruiter access required." },
        { status: 403 },
      );
    }

    const recruiterId = session.user.id;

    // Connect to database
    await connectToDatabase();

    // Get all jobs for this recruiter
    const jobs = await Job.find({ recruiter: recruiterId })
      .select("title companyName")
      .sort({ createdAt: -1 })
      .lean();

    // Format jobs for the dropdown
    const formattedJobs = jobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      companyName: job.companyName,
    }));

    return NextResponse.json({
      jobs: formattedJobs,
    });
  } catch (error) {
    console.error("Error fetching recruiter jobs list:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
