"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import MemeCanvas from "./MemeCanvas";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

interface Props {
  onGenerated: (s3Key: string, dataUrl: string) => void;
}

export default function MemePicker({ onGenerated }: Props) {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [filtered, setFiltered] = useState<MemeTemplate[]>([]);
  const [query, setQuery] = useState("");
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

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search meme templates…"
        value={query}
        onChange={(e) => filter(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {loading && <p className="text-sm text-gray-400">Loading templates…</p>}
      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {filtered.slice(0, 100).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t)}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-400 transition"
          >
            <Image src={t.url} alt={t.name} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}
