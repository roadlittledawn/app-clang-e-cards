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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Invites</h1>

      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="invite-email" className="sr-only">Email address</label>
        <input
          id="invite-email"
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? "Sending…" : "Send invite"}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}

      {/* Mobile: card list */}
      <ul className="sm:hidden space-y-3" aria-label="Invites list">
        {invites.map((inv) => (
          <li key={inv._id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-gray-900 text-sm break-all">{inv.email}</p>
              <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === "accepted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {inv.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
            <button onClick={() => copyLink(inv.inviteUrl)} className="text-xs text-indigo-600 hover:underline font-medium">
              {copied === inv.inviteUrl ? "Copied!" : "Copy invite link"}
            </button>
          </li>
        ))}
        {invites.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No invites yet.</p>}
      </ul>

      {/* Desktop: table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Sent</th>
              <th className="px-5 py-3 font-medium">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invites.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3 text-gray-900">{inv.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === "accepted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <button onClick={() => copyLink(inv.inviteUrl)} className="text-indigo-600 hover:underline text-xs font-medium">
                    {copied === inv.inviteUrl ? "Copied!" : "Copy link"}
                  </button>
                </td>
              </tr>
            ))}
            {invites.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No invites yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
