import CardForm from "@/components/cards/CardForm";

export default function NewCardPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a card</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <CardForm />
      </div>
    </div>
  );
}
