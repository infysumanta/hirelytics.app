// This file is for server-side use only, not client-side
import { S3Client } from '@aws-sdk/client-s3';

// Create a custom S3 client for Tigris S3 storage (server-side only)
export const createS3Client = () =>
  new S3Client({
    region: process.env.AWS_REGION!,
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
