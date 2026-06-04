import { S3Client } from "@aws-sdk/client-s3";

const REQUIRED = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET_NAME"] as const;

for (const key of REQUIRED) {
  if (!process.env[key]) throw new Error(`${key} environment variable is not set`);
}

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.S3_BUCKET_NAME!;

export function userImageKey(userId: string, filename: string): string {
  return `users/${userId}/images/${filename}`;
}
