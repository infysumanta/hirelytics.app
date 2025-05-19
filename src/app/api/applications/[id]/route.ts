import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";
import { auth } from "@/auth";
import Job from "@/models/job";
import { createS3Client } from "@/lib/s3-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Define the MonitoringImage interface based on the model
interface MonitoringImage {
  s3Key: string;
  timestamp: Date;
  signedUrl?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to access application data",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Fetch application by ID
    const application = await JobApplication.findById(id);
    const job = await Job.findById(application.jobId);

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    // Get query parameter to include base64 data or not
    const url = new URL(req.url);
    const includeBase64 = url.searchParams.get("includeBase64") === "true";

    // Generate signed URLs for monitoring images if present
    const appData = application.toJSON();

    // Process monitoring images if they exist
    if (appData.monitoringImages && appData.monitoringImages.length > 0) {
      const s3Client = createS3Client();
      const bucketName =
        appData.s3Bucket || process.env.AWS_S3_BUCKET || "hirelytics-uploads";

      // Generate signed URLs for each monitoring image
      const monitoringImagesWithUrls = await Promise.all(
        appData.monitoringImages.map(async (image: MonitoringImage) => {
          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: image.s3Key,
          });

          // Generate a URL that expires in 1 hour
          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          });

          return {
            ...image,
            signedUrl,
          };
        }),
      );

      // Replace the original monitoring images with ones that have signed URLs
      appData.monitoringImages = monitoringImagesWithUrls;
    }

    // Return application data
    const response = {
      success: true,
      application: {
        ...appData,
        // Only include base64 data if specifically requested
        ...(includeBase64 ? {} : { resumeBase64: "**base64 data stored**" }),
        job: job,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch application details" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to update application data",
        },
        { status: 401 },
      );
    }

    const id = params.id;

    // Find the application
    const application = await JobApplication.findById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
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
      { new: true },
    );

    const appData = updatedApplication.toJSON();

    // Process monitoring images if they exist
    if (appData.monitoringImages && appData.monitoringImages.length > 0) {
      const s3Client = createS3Client();
      const bucketName =
        appData.s3Bucket || process.env.AWS_S3_BUCKET || "hirelytics-uploads";

      // Generate signed URLs for each monitoring image
      const monitoringImagesWithUrls = await Promise.all(
        appData.monitoringImages.map(async (image: MonitoringImage) => {
          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: image.s3Key,
          });

          // Generate a URL that expires in 1 hour
          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          });

          return {
            ...image,
            signedUrl,
          };
        }),
      );

      // Replace the original monitoring images with ones that have signed URLs
      appData.monitoringImages = monitoringImagesWithUrls;
    }

    // Return updated application
    return NextResponse.json({
      success: true,
      application: {
        ...appData,
        resumeBase64: "**base64 data stored**", // Don't expose the full base64 data
      },
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update application" },
      { status: 500 },
    );
  }
}
