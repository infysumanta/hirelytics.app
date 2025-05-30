import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { createS3Client } from '@/lib/s3-client';
import Job from '@/models/job';
import { JobApplication } from '@/models/job-application';

// Define common interfaces
interface MonitoringImage {
  s3Key: string;
  timestamp: Date;
  signedUrl?: string;
}

interface InterviewMessage {
  text: string;
  sender: 'ai' | 'user' | 'system';
  timestamp: Date;
  questionId?: string;
  questionCategory?: string;
  feedback?: string;
  audioS3Key?: string;
  audioS3Bucket?: string;
  audioUrl?: string;
}

// Helper function to add signed URLs to audio messages
async function addAudioSignedUrls(messages: InterviewMessage[], s3Client: S3Client) {
  // Process each message that has audioS3Key and audioS3Bucket
  return await Promise.all(
    messages.map(async (message) => {
      if (message.audioS3Key && message.audioS3Bucket) {
        const command = new GetObjectCommand({
          Bucket: message.audioS3Bucket,
          Key: message.audioS3Key,
          ResponseContentType: 'audio/mpeg',
          ResponseContentDisposition: 'inline',
        });

        // Generate a URL that expires in 1 hour
        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          ...message,
          audioUrl: signedUrl,
        };
      }
      return message;
    })
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access application data',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch application by ID
    const application = await JobApplication.findById(id);
    const job = await Job.findById(application.jobId);

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Get query parameter to include base64 data or not
    const url = new URL(req.url);
    const includeBase64 = url.searchParams.get('includeBase64') === 'true';

    // Generate signed URLs for files stored in S3
    const appData = application.toJSON();
    const s3Client = createS3Client();
    const bucketName = appData.s3Bucket || process.env.AWS_S3_BUCKET || 'hirelytics-uploads';

    // Process monitoring images if they exist
    if (appData.monitoringImages && appData.monitoringImages.length > 0) {
      const monitoringImagesWithUrls = await Promise.all(
        appData.monitoringImages.map(async (image: MonitoringImage) => {
          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: image.s3Key,
          });

          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          });

          return {
            ...image,
            signedUrl,
          };
        })
      );

      appData.monitoringImages = monitoringImagesWithUrls;
    }

    // Process interview chat history audio files if they exist
    if (appData.interviewChatHistory && appData.interviewChatHistory.length > 0) {
      appData.interviewChatHistory = await addAudioSignedUrls(
        appData.interviewChatHistory,
        s3Client
      );
    }

    // Generate signed URL for resume if s3Key exists
    if (appData.s3Key) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: appData.s3Key,
      });

      const signedResumeUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      appData.signedResumeUrl = signedResumeUrl;
    }

    // Return application data with updated URLs
    const response = {
      success: true,
      application: {
        ...appData,
        resumeBase64: includeBase64 ? appData.resumeBase64 : '**base64 data stored**',
        job: job,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch application details' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to update application data',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find the application
    const application = await JobApplication.findById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Get request body
    const data = await req.json();

    // Only allow specific fields to be updated
    const allowedUpdates = {
      ...(data.status ? { status: data.status } : {}),
    };

    // Update application
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true }
    );

    const appData = updatedApplication.toJSON();

    // Process S3 stored files to generate signed URLs
    const s3Client = createS3Client();
    const bucketName = appData.s3Bucket || process.env.AWS_S3_BUCKET || 'hirelytics-uploads';

    // Process monitoring images if they exist
    if (appData.monitoringImages && appData.monitoringImages.length > 0) {
      const monitoringImagesWithUrls = await Promise.all(
        appData.monitoringImages.map(async (image: MonitoringImage) => {
          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: image.s3Key,
          });

          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          });

          return {
            ...image,
            signedUrl,
          };
        })
      );

      appData.monitoringImages = monitoringImagesWithUrls;
    }

    // Process interview chat history audio files if they exist
    if (appData.interviewChatHistory && appData.interviewChatHistory.length > 0) {
      appData.interviewChatHistory = await addAudioSignedUrls(
        appData.interviewChatHistory,
        s3Client
      );
    }

    // Generate signed URL for resume if s3Key exists
    if (appData.s3Key) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: appData.s3Key,
      });

      const signedResumeUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      appData.signedResumeUrl = signedResumeUrl;
    }

    // Get query parameter to include base64 data or not
    const url = new URL(req.url);
    const includeBase64 = url.searchParams.get('includeBase64') === 'true';

    // Return updated application
    return NextResponse.json({
      success: true,
      application: {
        ...appData,
        resumeBase64: includeBase64 ? appData.resumeBase64 : '**base64 data stored**',
      },
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update application' },
      { status: 500 }
    );
  }
}
