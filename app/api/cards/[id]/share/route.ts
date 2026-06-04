import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import ShareLink from "@/models/ShareLink";
import { generateShareToken, expiresAtFromDays, buildShareUrl, ExpiryDays } from "@/lib/share-link";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const card = await Card.findById(id);
  if (!card || card.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const links = await ShareLink.find({ cardId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(links.map((l) => ({ ...l, url: buildShareUrl(l.token) })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const card = await Card.findById(id);
  if (!card || card.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { expiryDays }: { expiryDays: ExpiryDays } = await req.json();
  const token = generateShareToken();
  const expiresAt = expiresAtFromDays(expiryDays);
  const link = await ShareLink.create({ cardId: id, token, expiresAt });
  return NextResponse.json({ ...link.toObject(), url: buildShareUrl(token) }, { status: 201 });
}
