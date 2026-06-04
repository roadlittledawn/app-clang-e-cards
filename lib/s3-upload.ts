import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, getS3Bucket, userImageKey } from "@/lib/s3";
import { randomUUID } from "crypto";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function validateUpload(mimeType: string, size: number): string | null {
  if (!ALLOWED_TYPES.includes(mimeType)) return "Unsupported file type. Use JPG, PNG, GIF, or WebP.";
  if (size > MAX_SIZE) return "File exceeds 10MB limit.";
  return null;
}

export async function createPresignedUploadUrl(
  userId: string,
  filename: string,
  mimeType: string
): Promise<{ url: string; s3Key: string }> {
  const ext = path.extname(filename) || ".jpg";
  const uuid = randomUUID();
  const s3Key = userImageKey(userId, `${uuid}${ext}`);
  const bucket = getS3Bucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: mimeType,
  });

  const url = await getSignedUrl(getS3Client(), command, { expiresIn: 300 });
  return { url, s3Key };
}

export function s3PublicUrl(s3Key: string): string {
  const bucket = process.env.S3_BUCKET_NAME ?? "";
  const region = process.env.AWS_REGION ?? "us-east-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}
