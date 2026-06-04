"use client";

import { useState, useEffect, useCallback, use } from "react";
import ExpiryPicker from "@/components/cards/ExpiryPicker";
import type { ExpiryDays } from "@/lib/share-link";

interface ShareLink { _id: string; url: string; expiresAt: string | null; createdAt: string }

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [expiry, setExpiry] = useState<ExpiryDays>(30);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    const res = await fetch(`/api/cards/${id}/share`);
    const data = await res.json();
    if (Array.isArray(data)) setLinks(data);
  }, [id]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  async function handleCreate() {
    setCreating(true);
    await fetch(`/api/cards/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiryDays: expiry }),
    });
    setCreating(false);
    fetchLinks();
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Share this card</h1>

      <div className="space-y-3 bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700">Link expires in:</p>
        <ExpiryPicker value={expiry} onChange={setExpiry} />
        <button
          onClick={handleCreate} disabled={creating}
          className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {creating ? "Generating…" : "Generate link"}
        </button>
      </div>

      {links.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Share links</h2>
          {links.map((link) => {
            const expired = isExpired(link.expiresAt);
            return (
              <div key={link._id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${expired ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"}`}>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {link.expiresAt
                      ? expired
                        ? "Expired"
                        : `Expires ${new Date(link.expiresAt).toLocaleDateString()}`
                      : "Never expires"}
                  </p>
                </div>
                {!expired && (
                  <button
                    onClick={() => copyLink(link.url)}
                    className="shrink-0 text-xs text-indigo-600 hover:underline font-medium"
                  >
                    {copied === link.url ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
