import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateUpload, createPresignedUploadUrl } from "@/lib/s3-upload";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, mimeType, size } = await req.json();
  const validationError = validateUpload(mimeType, size);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { url, s3Key } = await createPresignedUploadUrl(session.user.id, filename, mimeType);
  return NextResponse.json({ url, s3Key });
}
