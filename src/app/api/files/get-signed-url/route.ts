import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client } from "@/lib/s3-client";
import { auth } from "@/auth";

// Create S3 client using the common function
const s3Client = createS3Client();

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to access files",
        },
        { status: 401 },
      );
    }

    // Get file key and bucket from request
    const { key, bucket } = await req.json();

    if (!key || !bucket) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "File key and bucket name are required",
        },
        { status: 400 },
      );
    }

    // Generate a signed URL that expires in 15 minutes (900 seconds)
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900,
    });

    // Return the signed URL
    return NextResponse.json({
      success: true,
      signedUrl,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to generate signed URL",
      },
      { status: 500 },
    );
  }
}
