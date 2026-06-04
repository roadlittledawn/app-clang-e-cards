import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ShareLink from "@/models/ShareLink";
import Card from "@/models/Card";
import { isExpired } from "@/lib/share-link";
import { s3PublicUrl } from "@/lib/s3-upload";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectDB();

  const link = await ShareLink.findOne({ token }).lean();
  if (!link) return NextResponse.json({ error: "Card not found" }, { status: 404 });
  if (isExpired(link.expiresAt)) {
    return NextResponse.json({ error: "This card has expired" }, { status: 410 });
  }

  const card = await Card.findById(link.cardId).lean();
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  let imageUrl: string | null = null;
  if (card.image) {
    if (card.image.mode === "giphy" && card.image.giphyUrl) {
      imageUrl = card.image.giphyUrl;
    } else if (card.image.s3Key) {
      imageUrl = s3PublicUrl(card.image.s3Key);
    }
  }

  return NextResponse.json({
    title: card.title,
    message: card.message,
    recipientName: card.recipientName,
    effect: card.effect ?? null,
    templateType: card.templateType,
    imageUrl,
  });
}
