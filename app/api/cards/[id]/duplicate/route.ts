import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const original = await Card.findById(id);
  if (!original || original.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const copy = await Card.create({
    userId: session.user.id,
    templateType: original.templateType,
    title: original.title,
    message: original.message,
    recipientName: original.recipientName,
    image: original.image,
    effect: original.effect,
  });
  return NextResponse.json(copy, { status: 201 });
}
