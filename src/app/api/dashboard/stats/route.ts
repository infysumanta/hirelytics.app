import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import Job from "@/models/job";
import User from "@/models/user";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { role, id: userId } = session.user;

    // Common statistics for all dashboards
    const totalJobs = await Job.countDocuments({ isActive: true });
    const totalCandidates = await User.countDocuments({
      role: "candidate",
      isActive: true,
    });
    const totalRecruiters = await User.countDocuments({
      role: "recruiter",
      isActive: true,
    });

    // Role-specific data
    switch (role) {
      case "admin":
        const recentJobsAdmin = await Job.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("recruiter", "name");

        const applicationStatusData = await JobApplication.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const jobsPerRecruiter = await Job.aggregate([
          { $match: { isActive: true } },
          {
            $lookup: {
              from: "users",
              localField: "recruiter",
              foreignField: "_id",
              as: "recruiterInfo",
            },
          },
          { $unwind: "$recruiterInfo" },
          { $group: { _id: "$recruiterInfo.name", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]);

        return NextResponse.json({
          totalJobs,
          totalCandidates,
          totalRecruiters,
          recentJobs: recentJobsAdmin,
          applicationStatusData,
          jobsPerRecruiter,
        });

      case "recruiter":
        const recruiterObjectId = new mongoose.Types.ObjectId(userId);

        // Count jobs created by this recruiter
        const myJobs = await Job.countDocuments({
          recruiter: recruiterObjectId,
          isActive: true,
        });

        // Get all job IDs for this recruiter
        const recruiterJobs = await Job.find({
          recruiter: recruiterObjectId,
          isActive: true,
        }).select("_id");
        const jobIdStrings = recruiterJobs.map((job) => job._id.toString());

        // Count applications for this recruiter's jobs
        const totalApplications = await JobApplication.countDocuments({
          jobId: { $in: jobIdStrings },
        });

        // Get applications by status for this recruiter's jobs
        const applicationsByStatus = await JobApplication.aggregate([
          { $match: { jobId: { $in: jobIdStrings } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        // Get recent applications for this recruiter's jobs
        const recentApplications = await JobApplication.aggregate([
          { $match: { jobId: { $in: jobIdStrings } } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "jobs",
              localField: "jobId",
              foreignField: "urlId",
              as: "jobInfo",
            },
          },
          { $unwind: { path: "$jobInfo", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "candidateInfo",
            },
          },
          {
            $unwind: {
              path: "$candidateInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              status: 1,
              createdAt: 1,
              jobInfo: {
                title: "$jobInfo.title",
                companyName: "$jobInfo.companyName",
              },
              candidateName: {
                $ifNull: ["$candidateInfo.name", "$candidateName"],
              },
            },
          },
        ]);

        return NextResponse.json({
          myJobs,
          totalApplications,
          applicationsByStatus,
          recentApplications,
        });

      case "candidate":
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Get count of applications by this candidate
        const myApplicationsCount = await JobApplication.countDocuments({
          userId: userObjectId,
        });

        // Get application status breakdown
        const myApplicationsByStatus = await JobApplication.aggregate([
          { $match: { userId: userObjectId } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        // Get recent available jobs
        const recentJobsCandidate = await Job.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("title companyName location createdAt");

        // Get candidate's recent job applications with job details
        const myRecentApplications = await JobApplication.aggregate([
          { $match: { userId: userObjectId } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          // Handle lookup for job info using the jobId string
          {
            $lookup: {
              from: "jobs",
              localField: "jobId",
              foreignField: "urlId",
              as: "jobInfo",
            },
          },
          { $unwind: { path: "$jobInfo", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              status: 1,
              createdAt: 1,
              jobInfo: {
                title: { $ifNull: ["$jobInfo.title", "Unknown Job"] },
                companyName: {
                  $ifNull: ["$jobInfo.companyName", "Unknown Company"],
                },
              },
            },
          },
        ]);

        return NextResponse.json({
          myApplicationsCount,
          myApplicationsByStatus,
          recentJobs: recentJobsCandidate,
          myRecentApplications,
        });

      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 },
    );
  }
}
