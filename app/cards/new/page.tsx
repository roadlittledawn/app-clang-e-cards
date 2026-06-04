import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CardForm from "@/components/cards/CardForm";

export default async function NewCardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a card</h1>
      <CardForm />
    </div>
  );
}
