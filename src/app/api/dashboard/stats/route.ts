import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/job';
import { JobApplication } from '@/models/job-application';
import User from '@/models/user';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { role, id: userId } = session.user;

    // Common statistics for all dashboards
    const totalJobs = await Job.countDocuments({ isActive: true }).catch(() => 0);
    const totalCandidates = await User.countDocuments({
      role: 'candidate',
      isActive: true,
    }).catch(() => 0);
    const totalRecruiters = await User.countDocuments({
      role: 'recruiter',
      isActive: true,
    }).catch(() => 0);

    // Role-specific data
    switch (role) {
      case 'admin':
        const recentJobsAdmin = await Job.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('recruiter', 'name')
          .catch(() => []);

        const applicationStatusData = await JobApplication.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).catch(() => []);

        const jobsPerRecruiter = await Job.aggregate([
          { $match: { isActive: true } },
          {
            $lookup: {
              from: 'users',
              localField: 'recruiter',
              foreignField: '_id',
              as: 'recruiterInfo',
            },
          },
          { $unwind: '$recruiterInfo' },
          { $group: { _id: '$recruiterInfo.name', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]).catch(() => []);

        return NextResponse.json({
          totalJobs,
          totalCandidates,
          totalRecruiters,
          recentJobs: recentJobsAdmin,
          applicationStatusData,
          jobsPerRecruiter,
        });

      case 'recruiter':
        const recruiterObjectId = new mongoose.Types.ObjectId(userId);

        const myJobs = await Job.countDocuments({
          recruiter: recruiterObjectId,
          isActive: true,
        }).catch(() => 0);

        const recruiterJobs = await Job.find({
          recruiter: recruiterObjectId,
          isActive: true,
        })
          .select('_id')
          .catch(() => []);
        const jobIdStrings = recruiterJobs.map((job) => job._id.toString());

        const totalApplications = await JobApplication.countDocuments({
          jobId: { $in: jobIdStrings },
        }).catch(() => 0);

        const applicationsByStatus = await JobApplication.aggregate([
          { $match: { jobId: { $in: jobIdStrings } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).catch(() => []);

        const recentApplications = await JobApplication.aggregate([
          { $match: { jobId: { $in: jobIdStrings } } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'jobs',
              localField: 'jobId',
              foreignField: '_id',
              as: 'jobInfo',
            },
          },
          {
            $unwind: {
              path: '$jobInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'candidateInfo',
            },
          },
          {
            $unwind: {
              path: '$candidateInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              status: 1,
              createdAt: 1,
              jobInfo: {
                title: { $ifNull: ['$jobInfo.title', 'Unknown Job'] },
                companyName: {
                  $ifNull: ['$jobInfo.companyName', 'Unknown Company'],
                },
              },
              candidateName: {
                $ifNull: ['$candidateInfo.name', '$candidateName'],
              },
            },
          },
        ]).catch(() => []);

        return NextResponse.json({
          myJobs,
          totalApplications,
          applicationsByStatus,
          recentApplications,
        });

      case 'candidate':
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const myApplicationsCount = await JobApplication.countDocuments({
          userId: userObjectId,
        }).catch(() => 0);

        const myApplicationsByStatus = await JobApplication.aggregate([
          { $match: { userId: userObjectId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).catch(() => []);

        const recentJobsCandidate = await Job.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title companyName location createdAt')
          .catch(() => []);

        const myRecentApplications = await JobApplication.aggregate([
          { $match: { userId: userObjectId } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'jobs',
              localField: 'jobId',
              foreignField: '_id',
              as: 'jobInfo',
            },
          },
          {
            $unwind: {
              path: '$jobInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userInfo',
            },
          },
          {
            $unwind: {
              path: '$userInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              status: 1,
              createdAt: 1,
              jobInfo: {
                title: { $ifNull: ['$jobInfo.title', 'Unknown Job'] },
                companyName: {
                  $ifNull: ['$jobInfo.companyName', 'Unknown Company'],
                },
              },
              userInfo: {
                name: { $ifNull: ['$userInfo.name', 'Unknown User'] },
                email: { $ifNull: ['$userInfo.email', 'Unknown Email'] },
              },
            },
          },
        ]).catch(() => []);

        return NextResponse.json({
          myApplicationsCount,
          myApplicationsByStatus,
          recentJobs: recentJobsCandidate,
          myRecentApplications,
        });

      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
