import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/job";
import User from "@/models/user";
interface JobQuery {
  isActive: boolean;
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  skills?: { $in: string[] };
  location?: string;
}

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const skills = searchParams.get("skills")
      ? searchParams.get("skills")!.split(",")
      : [];
    const location = searchParams.get("location") || "";

    const query: JobQuery = { isActive: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by skills
    if (skills.length > 0) {
      query.skills = { $in: skills };
    }

    // Filter by location
    if (location) {
      query.location = location;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch jobs with pagination
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1) // Get one extra to check if there are more results
      .lean();

    // Check if there are more results for the next page
    const hasMore = jobs.length > limit;
    const paginatedJobs = hasMore ? jobs.slice(0, limit) : jobs;

    // Get recruiter information for each job
    const jobsWithRecruiters = await Promise.all(
      paginatedJobs.map(async (job) => {
        const recruiter = await User.findOne({ _id: job.recruiter }).lean();

        return {
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
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          recruiter: recruiter
            ? {
                id: recruiter._id.toString(),
                name: recruiter.name,
                email: recruiter.email,
              }
            : null,
        };
      }),
    );

    // Return jobs with pagination info
    return NextResponse.json({
      jobs: jobsWithRecruiters,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs: " + errorMessage },
      { status: 500 },
    );
  }
}
