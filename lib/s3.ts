import { S3Client } from "@aws-sdk/client-s3";

export function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export function getS3Bucket(): string {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) throw new Error("S3_BUCKET_NAME environment variable is not set");
  return bucket;
}

export function userImageKey(userId: string, filename: string): string {
  return `users/${userId}/images/${filename}`;
}
