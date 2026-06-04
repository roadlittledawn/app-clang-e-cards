import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import ShareLink from "@/models/ShareLink";

type Params = { params: Promise<{ id: string }> };

async function getOwnedCard(userId: string, id: string) {
  const card = await Card.findById(id);
  if (!card) return null;
  if (card.userId.toString() !== userId) return null;
  return card;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const card = await getOwnedCard(session.user.id, id);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const card = await getOwnedCard(session.user.id, id);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, message, recipientName, image, effect } = await req.json();
  if (title) card.title = title;
  if (message) card.message = message;
  if (recipientName) card.recipientName = recipientName;
  if (image !== undefined) card.image = image;
  if (effect !== undefined) card.effect = effect;
  await card.save();
  return NextResponse.json(card);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const card = await getOwnedCard(session.user.id, id);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await ShareLink.deleteMany({ cardId: card._id });
  await card.deleteOne();
  return NextResponse.json({ ok: true });
}
