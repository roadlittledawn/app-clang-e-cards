import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { s3PublicUrl } from "@/lib/s3-upload";
import ImageModel from "@/models/Image";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const images = await ImageModel.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return NextResponse.json(
    images.map((img) => ({ ...img, url: s3PublicUrl(img.s3Key) }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { s3Key, filename, size, mimeType } = await req.json();
  if (!s3Key || !filename || !size || !mimeType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();
  const image = await ImageModel.create({
    userId: session.user.id,
    s3Key,
    filename,
    size,
    mimeType,
  });

  return NextResponse.json({ ...image.toObject(), url: s3PublicUrl(s3Key) }, { status: 201 });
}
