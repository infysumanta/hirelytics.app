import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/job';
import { JobApplication } from '@/models/job-application';

const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME || 'hirelytics';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; key: string }> }
) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access monitoring images',
        },
        { status: 401 }
      );
    }

    // Only recruiters can access monitoring images
    if (session.user?.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Unauthorized. Recruiter access required.' },
        { status: 403 }
      );
    }

    const { id, key } = await params;

    // Verify the application exists
    const application = await JobApplication.findById(id);
    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify the recruiter has permission to access this application
    // by checking if they are assigned to the job
    const job = await Job.findById(application.jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Associated job not found' },
        { status: 404 }
      );
    }

    // Check if the current recruiter is assigned to this job
    if (job.recruiter.toString() !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. You are not the recruiter for this job.',
        },
        { status: 403 }
      );
    }

    // Find the requested monitoring image in the application
    const monitoringImage = application.monitoringImages?.find(
      (img: { s3Key: string }) => img.s3Key === decodeURIComponent(key)
    );

    if (!monitoringImage) {
      return NextResponse.json(
        { success: false, message: 'Monitoring image not found' },
        { status: 404 }
      );
    }

    // Generate a signed URL for the image
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: monitoringImage.s3Key,
    });

    // Generate a URL that expires in 5 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Return the signed URL
    return NextResponse.json({
      success: true,
      url: signedUrl,
      timestamp: monitoringImage.timestamp,
    });
  } catch (error) {
    console.error('Error accessing monitoring image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to access monitoring image' },
      { status: 500 }
    );
  }
}
