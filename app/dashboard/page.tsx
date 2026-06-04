"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Card {
  _id: string;
  title: string;
  recipientName: string;
  createdAt: string;
  effect?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = () => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCards(data); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchCards, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this card? This cannot be undone.")) return;
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    fetchCards();
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/cards/${id}/duplicate`, { method: "POST" });
    const copy = await res.json();
    router.push(`/cards/${copy._id}/edit`);
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
        <Link
          href="/cards/new"
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New card
        </Link>
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}

      {!loading && cards.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No cards yet.</p>
          <Link href="/cards/new" className="text-indigo-600 hover:underline">Create your first card</Link>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Title</th>
              <th className="pb-2">Recipient</th>
              <th className="pb-2">Created</th>
              <th className="pb-2">Effect</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cards.map((card) => (
              <tr key={card._id}>
                <td className="py-3 font-medium text-gray-900">{card.title}</td>
                <td className="py-3 text-gray-600">{card.recipientName}</td>
                <td className="py-3 text-gray-500">{new Date(card.createdAt).toLocaleDateString()}</td>
                <td className="py-3 text-gray-500 capitalize">{card.effect ?? "none"}</td>
                <td className="py-3">
                  <div className="flex gap-3 justify-end">
                    <Link href={`/cards/${card._id}/share`} className="text-indigo-600 hover:underline">Share</Link>
                    <Link href={`/cards/${card._id}/edit`} className="text-gray-600 hover:underline">Edit</Link>
                    <button onClick={() => handleDuplicate(card._id)} className="text-gray-600 hover:underline">Duplicate</button>
                    <button onClick={() => handleDelete(card._id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
