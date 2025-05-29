import { HeadBucketCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

import { createS3Client } from '@/lib/s3-client';

export const checkBucketAccess = async () => {
  try {
    const s3Client = createS3Client();
    const bucketName = process.env.AWS_BUCKET_NAME || 'hirelytics';

    console.log(`Checking access to bucket: ${bucketName}...`);

    // First check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));

    // Then list some objects to verify access
    const { Contents } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 5,
      })
    );

    console.log(`✅ Successfully connected to bucket: ${bucketName}`);
    console.log(`Found ${Contents?.length || 0} objects in the bucket`);

    if (Contents?.length) {
      console.log('Sample objects:');
      Contents.forEach((item) => {
        console.log(` - ${item.Key} (${item.Size} bytes)`);
      });
    }

    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`❌ Failed to access S3 bucket: ${error.message}`);
    return false;
  }
};
