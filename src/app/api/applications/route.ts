import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { JobApplication } from '@/models/job-application';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const data = await req.json();

    // Log received data for debugging (excluding large base64 content)
    console.log('Received application data:', {
      jobId: data.jobId,
      userId: data.userId,
      fileName: data.fileName,
      hasBase64: !!data.resumeBase64,
      hasResumeUrl: !!data.resumeUrl,
      hasS3Key: !!data.s3Key,
      hasS3Bucket: !!data.s3Bucket,
    });

    // Validate required fields
    if (
      !data.jobId ||
      !data.userId || // Essential fields
      !data.resumeUrl ||
      !data.resumeBase64 ||
      !data.fileName
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create application data with all required fields and normalize optional fields
    const applicationData = {
      jobId: data.jobId,
      userId: data.userId,
      // Only include candidate name and email if they exist
      ...(data.candidateName ? { candidateName: data.candidateName } : {}),
      ...(data.email ? { email: data.email } : {}),
      resumeUrl: data.resumeUrl,
      resumeBase64: data.resumeBase64,
      fileName: data.fileName,
      // Store S3 key and bucket if available for generating signed URLs later
      ...(data.s3Key ? { s3Key: data.s3Key } : {}),
      ...(data.s3Bucket ? { s3Bucket: data.s3Bucket } : {}),
      preferredLanguage: data.preferredLanguage || 'en',
    };

    console.log('Creating application with data:', {
      jobId: applicationData.jobId,
      userId: applicationData.userId,
      hasCandidateName: !!applicationData.candidateName,
      hasEmail: !!applicationData.email,
    });

    // Create a new job application
    const jobApplication = await JobApplication.create(applicationData);

    // Return success with the created application (without exposing the full base64 data)
    return NextResponse.json(
      {
        success: true,
        application: {
          ...jobApplication.toJSON(),
          resumeBase64: '**base64 data stored**', // Don't return the full base64 string
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access applications',
        },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    const userId = url.searchParams.get('userId');
    const id = url.searchParams.get('id'); // Get a specific application by ID

    // If requesting a specific application by ID
    if (id) {
      const application = await JobApplication.findById(id);

      if (!application) {
        return NextResponse.json(
          { success: false, message: 'Application not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        application: {
          ...application.toJSON(),
          resumeBase64: '**base64 data stored**', // Don't return the full base64 data
        },
      });
    }

    // Otherwise, build filter for listing applications
    const filter: { jobId?: string; userId?: string } = {};
    if (jobId) filter.jobId = jobId;
    if (userId) filter.userId = userId;

    // Get job applications with filters - explicitly include only the fields we need
    // This is more efficient than excluding fields, especially for match score data
    const jobApplications = await JobApplication.find(filter)
      .select({
        jobId: 1,
        userId: 1,
        fileName: 1,
        status: 1,
        resumeUrl: 1,
        preferredLanguage: 1,
        createdAt: 1,
        updatedAt: 1,
        // Include all match-related fields from parsedResume
        'parsedResume.matchScore': 1,
        'parsedResume.matchedAt': 1,
        'parsedResume.skills': 1,
        'parsedResume.topSkillMatches': 1,
        'parsedResume.missingSkills': 1,
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, applications: jobApplications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
