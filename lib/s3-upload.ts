import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET, userImageKey } from "@/lib/s3";
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

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: mimeType,
    ContentLength: undefined,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min TTL
  return { url, s3Key };
}

export function s3PublicUrl(s3Key: string): string {
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
}
