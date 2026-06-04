import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const cards = await Card.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, message, recipientName, image, effect, templateType } = body;
  const template = templateType === "meme" ? "meme" : "standard";

  if (template === "meme") {
    // Image-only card: no text required, but a generated meme image is.
    if (!image || image.mode !== "meme" || !image.s3Key) {
      return NextResponse.json({ error: "A meme image is required" }, { status: 400 });
    }
  } else if (!title || !message || !recipientName) {
    return NextResponse.json({ error: "title, message, and recipientName are required" }, { status: 400 });
  }

  await connectDB();
  const card = await Card.create({
    userId: session.user.id,
    templateType: template,
    title: title ?? "",
    message: message ?? "",
    recipientName: recipientName ?? "",
    image: image ?? undefined,
    effect: effect ?? undefined,
  });
  return NextResponse.json(card, { status: 201 });
}
