import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import CardForm from "@/components/cards/CardForm";

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  await connectDB();
  const card = await Card.findById(id).lean();
  if (!card || card.userId.toString() !== session.user.id) notFound();

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit card</h1>
      <CardForm initial={{
        id: card._id.toString(),
        title: card.title,
        message: card.message,
        recipientName: card.recipientName,
        effect: card.effect,
      }} />
    </div>
  );
}
