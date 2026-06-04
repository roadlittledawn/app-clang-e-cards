import Link from "next/link";
import CardForm from "@/components/cards/CardForm";

export default async function NewCardPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  if (template === "meme") {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create a meme</h1>
        <p className="text-sm text-gray-500 mb-6">Caption a meme to share — no title or message needed.</p>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <CardForm templateType="meme" />
        </div>
      </div>
    );
  }

  if (template === "standard") {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a card</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <CardForm />
        </div>
      </div>
    );
  }

  // No template chosen yet — show the chooser.
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">What do you want to make?</h1>
      <p className="text-sm text-gray-500 mb-6">Pick a template to get started.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/cards/new?template=standard"
          className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-400 hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="text-3xl mb-3">💌</div>
          <h2 className="font-semibold text-gray-900">Greeting card</h2>
          <p className="text-sm text-gray-500 mt-1">A title, message, and recipient — with an optional image, GIF, or meme.</p>
        </Link>
        <Link
          href="/cards/new?template=meme"
          className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-400 hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="text-3xl mb-3">😂</div>
          <h2 className="font-semibold text-gray-900">Meme</h2>
          <p className="text-sm text-gray-500 mt-1">Just a captioned meme to share. No title or message.</p>
        </Link>
      </div>
    </div>
  );
}
