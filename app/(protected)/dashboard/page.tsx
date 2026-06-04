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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
        <Link
          href="/cards/new"
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + New card
        </Link>
      </div>

      {loading && <div className="text-center py-16 text-gray-400">Loading…</div>}

      {!loading && cards.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500 text-lg mb-3">No cards yet.</p>
          <Link href="/cards/new" className="text-indigo-600 hover:underline font-medium">
            Create your first card →
          </Link>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <>
          {/* Mobile: card list */}
          <ul className="sm:hidden space-y-3" aria-label="Cards list">
            {cards.map((card) => (
              <li key={card._id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">{card.title}</p>
                  <p className="text-sm text-gray-500">For {card.recipientName}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(card.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link href={`/cards/${card._id}/share`} className="text-sm text-indigo-600 font-medium hover:underline">Share</Link>
                  <Link href={`/cards/${card._id}/edit`} className="text-sm text-gray-600 hover:underline">Edit</Link>
                  <button onClick={() => handleDuplicate(card._id)} className="text-sm text-gray-600 hover:underline">Duplicate</button>
                  <button onClick={() => handleDelete(card._id)} className="text-sm text-red-500 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Recipient</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Effect</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cards.map((card) => (
                  <tr key={card._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-900">{card.title}</td>
                    <td className="px-5 py-3 text-gray-600">{card.recipientName}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(card.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{card.effect ?? "none"}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3 justify-end">
                        <Link href={`/cards/${card._id}/share`} className="text-indigo-600 hover:underline font-medium">Share</Link>
                        <Link href={`/cards/${card._id}/edit`} className="text-gray-600 hover:underline">Edit</Link>
                        <button onClick={() => handleDuplicate(card._id)} className="text-gray-600 hover:underline">Duplicate</button>
                        <button onClick={() => handleDelete(card._id)} className="text-red-500 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
