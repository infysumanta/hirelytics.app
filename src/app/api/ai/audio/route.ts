import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createS3Client } from "@/lib/s3-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Schema for validating the request body
const audioRequestSchema = z.object({
  key: z.string(),
  bucket: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const { key, bucket } = audioRequestSchema.parse(body);

    // Get bucket name from request or use default
    const bucketName = bucket || process.env.AWS_BUCKET_NAME || "hirelytics";

    // Create S3 client
    const s3Client = createS3Client();

    // Generate pre-signed URL
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    return NextResponse.json({
      success: true,
      url: signedUrl,
    });
  } catch (error) {
    console.error("Error generating audio signed URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    );
  }
}
