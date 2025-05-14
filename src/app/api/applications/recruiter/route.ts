import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { auth } from "@/auth";
import Job from "@/models/job";

export async function GET(req: NextRequest) {
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

    // Get query parameters for filtering
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Prepare filter - only get applications for jobs where the current user is the recruiter
    const recruiterJobs = await Job.find({ recruiter: recruiterId }).select(
      "_id",
    );
    const recruiterJobIds = recruiterJobs.map((job) => job._id.toString());

    // Build the query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      jobId: { $in: recruiterJobIds },
    };

    // Add job filter if specified
    if (jobId) {
      filter.jobId = jobId;
    }

    // Add search if specified
    if (search) {
      filter.$or = [
        { candidateName: { $regex: search, $options: "i" } },
        { fileName: { $regex: search, $options: "i" } },
        { "parsedResume.skills": { $regex: search, $options: "i" } },
      ];
    }

    // Count total results for pagination
    const totalCount = await JobApplication.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Find applications and populate with job data
    const applications = await JobApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch job details for each application
    const enhancedApplications = await Promise.all(
      applications.map(async (app) => {
        try {
          // Ensure we have a valid jobId to look up
          if (!app.jobId) {
            return {
              ...app,
              job: { title: "Unknown Job", companyName: "Unknown Company" },
            };
          }

          const job = await Job.findById(app.jobId)
            .select("title companyName")
            .lean();

          // Check if job was found and has required fields
          if (!job || !job.title || !job.companyName) {
            return {
              ...app,
              job: { title: "Unknown Job", companyName: "Unknown Company" },
            };
          }

          return {
            ...app,
            job: {
              title: job.title,
              companyName: job.companyName,
            },
          };
        } catch (error) {
          console.error(
            `Error fetching job details for application ${app._id}:`,
            error,
          );
          return {
            ...app,
            job: { title: "Error Loading Job", companyName: "Error" },
          };
        }
      }),
    );

    // Return the applications with pagination info
    return NextResponse.json({
      applications: enhancedApplications,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching recruiter job applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}
