import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createS3Client } from "./s3-client";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Uploads an audio buffer to S3
 * @param audioBuffer The audio buffer to upload
 * @param applicationId The application ID to associate the audio with
 * @returns The S3 key of the uploaded audio file
 */
export async function uploadAudioToS3(
  audioBuffer: Buffer,
  applicationId: string,
): Promise<{
  s3Key: string;
  s3Bucket: string;
}> {
  try {
    // Create S3 client
    const s3Client = createS3Client();

    // Get bucket name from environment or use default
    const bucketName = process.env.AWS_BUCKET_NAME || "hirelytics";

    // Generate a unique filename with timestamp
    const timestamp = new Date().getTime();
    const randomId = uuidv4().substring(0, 8); // Use first 8 chars of UUID for brevity
    const key = `audio/${applicationId}/${timestamp}-${randomId}.mp3`;

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: audioBuffer,
        ContentType: "audio/mpeg",
      }),
    );

    // Return the S3 key and bucket
    return {
      s3Key: key,
      s3Bucket: bucketName,
    };
  } catch (error) {
    console.error("Error uploading audio to S3:", error);
    throw error;
  }
}

/**
 * Generates a signed URL for an S3 audio file
 * @param s3Key The S3 key of the audio file
 * @param s3Bucket The S3 bucket containing the audio file
 * @returns The signed URL for the audio file
 */
export async function getAudioSignedUrl(
  s3Key: string,
  s3Bucket?: string,
): Promise<string> {
  try {
    // Create S3 client
    const s3Client = createS3Client();

    // Get bucket name from parameter or use default
    const bucketName = s3Bucket || process.env.AWS_BUCKET_NAME || "hirelytics";

    // Generate pre-signed URL
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating audio signed URL:", error);
    throw error;
  }
}
