import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/models/job-application";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME || "hirelytics";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image, timestamp } = await request.json();

    // Convert base64 to buffer
    const buffer = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );

    // Generate unique key for S3
    const key = `monitoring/${id}/${uuidv4()}.jpg`;

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      }),
    );

    // Update application document
    await connectToDatabase();
    await JobApplication.updateOne(
      { _id: id },
      {
        $push: {
          monitoringImages: {
            s3Key: key,
            timestamp: new Date(timestamp),
          },
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error uploading monitoring image:", error);
    return NextResponse.json(
      { error: "Failed to upload monitoring image" },
      { status: 500 },
    );
  }
}
