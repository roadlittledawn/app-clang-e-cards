import { notFound } from "next/navigation";
import Image from "next/image";
import EffectPlayer from "@/components/effects/EffectPlayer";

interface CardData {
  title: string;
  message: string;
  recipientName: string;
  effect: string | null;
  imageUrl: string | null;
  templateType: string;
}

async function getCard(token: string): Promise<CardData | { error: string; status: number }> {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/view/${token}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) return { error: data.error, status: res.status };
  return data;
}

export default async function ViewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getCard(token);

  if ("error" in result) {
    if (result.status === 410) {
      return <ExpiredCard />;
    }
    notFound();
  }

  const card = result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <EffectPlayer effect={card.effect} />
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
        {card.imageUrl && (
          <div className="relative w-full aspect-video bg-gray-100">
            <Image
              src={card.imageUrl}
              alt={card.title}
              fill
              className="object-contain"
              sizes="640px"
              unoptimized={card.imageUrl.includes("giphy.com")}
            />
          </div>
        )}
        <div className="p-8 space-y-4">
          <p className="text-sm font-medium text-indigo-500 tracking-wide uppercase">For {card.recipientName}</p>
          <h1 className="text-2xl font-bold text-gray-900">{card.title}</h1>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{card.message}</p>
        </div>
      </div>
    </div>
  );
}

function ExpiredCard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">This card has expired</h1>
        <p className="text-gray-500 text-sm">The link is no longer active. Ask the sender to generate a new one.</p>
      </div>
    </div>
  );
}
