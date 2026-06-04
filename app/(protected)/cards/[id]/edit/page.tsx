import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import CardForm from "@/components/cards/CardForm";

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  await connectDB();
  const card = await Card.findById(id).lean();
  if (!card || card.userId.toString() !== (session?.user as { id?: string })?.id) notFound();

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
        }} />
      </div>
    </div>
  );
}
