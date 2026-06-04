import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import CardForm from "@/components/cards/CardForm";
import { s3PublicUrl } from "@/lib/s3-upload";

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  await connectDB();
  const card = await Card.findById(id).lean();
  if (!card || card.userId.toString() !== (session?.user as { id?: string })?.id) notFound();

  // Compute previewUrl server-side so the client form can show the existing image
  let imageWithPreview = card.image
    ? {
        ...card.image,
        imageId: card.image.imageId?.toString() as unknown as typeof card.image.imageId,
        previewUrl:
          card.image.mode === "giphy"
            ? card.image.giphyUrl
            : card.image.s3Key
            ? s3PublicUrl(card.image.s3Key)
            : undefined,
      }
    : undefined;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit card</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <CardForm initial={{
          id: card._id.toString(),
          title: card.title,
          message: card.message,
          recipientName: card.recipientName,
          effect: card.effect,
          image: imageWithPreview,
        }} />
      </div>
    </div>
  );
}
