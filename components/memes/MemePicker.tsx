"use client";

import { useState, useEffect, useCallback } from "react";
import MemeCanvas from "./MemeCanvas";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

const PAGE_SIZE = 12;

interface Props {
  onGenerated: (s3Key: string, dataUrl: string) => void;
}

export default function MemePicker({ onGenerated }: Props) {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [filtered, setFiltered] = useState<MemeTemplate[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<MemeTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/memes/templates")
      .then((r) => r.json())
      .then((data) => {
        const list: MemeTemplate[] = data?.data?.memes ?? [];
        setTemplates(list);
        setFiltered(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const filter = useCallback((q: string) => {
    setQuery(q);
    setPage(0);
    const lower = q.toLowerCase();
    setFiltered(templates.filter((t) => t.name.toLowerCase().includes(lower)));
  }, [templates]);

  if (selected) {
    return (
      <div className="space-y-3">
        <button type="button" onClick={() => setSelected(null)} className="text-sm text-indigo-600 hover:underline">
          ← Back to templates
        </button>
        <MemeCanvas template={selected} onGenerated={onGenerated} />
      </div>
    );
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const page_items = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search meme templates…"
        value={query}
        onChange={(e) => filter(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {loading && <p className="text-sm text-gray-400">Loading templates…</p>}
      <div className="grid grid-cols-3 gap-2">
        {page_items.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t)}
            className="rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-400 focus:outline-none focus:border-indigo-500 transition bg-gray-50 text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.url} alt={t.name} className="w-full h-auto block" loading="lazy" />
            <p className="text-xs text-gray-500 truncate px-1.5 py-1">{t.name}</p>
          </button>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← Prev
          </button>
          <span className="text-gray-400 text-xs">Page {page + 1} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
