"use client";

import { useState, useEffect, useCallback } from "react";

interface Invite {
  _id: string;
  email: string;
  status: "pending" | "accepted";
  createdAt: string;
  inviteUrl: string;
}

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchInvites = useCallback(async () => {
    const res = await fetch("/api/invites");
    const data = await res.json();
    if (Array.isArray(data)) setInvites(data);
  }, []);

  useEffect(() => { fetchInvites(); }, [fetchInvites]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok && res.status !== 409) { setError(data.error); return; }
    setEmail("");
    fetchInvites();
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Invites</h1>

      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="email" required placeholder="Email address" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit" disabled={loading}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Sending…" : "Send invite"}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Email</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Sent</th>
            <th className="pb-2">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invites.map((inv) => (
            <tr key={inv._id} className="py-2">
              <td className="py-2 text-gray-900">{inv.email}</td>
              <td className="py-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === "accepted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {inv.status}
                </span>
              </td>
              <td className="py-2 text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
              <td className="py-2">
                <button
                  onClick={() => copyLink(inv.inviteUrl)}
                  className="text-indigo-600 hover:underline text-xs"
                >
                  {copied === inv.inviteUrl ? "Copied!" : "Copy link"}
                </button>
              </td>
            </tr>
          ))}
          {invites.length === 0 && (
            <tr><td colSpan={4} className="py-4 text-center text-gray-400">No invites yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
