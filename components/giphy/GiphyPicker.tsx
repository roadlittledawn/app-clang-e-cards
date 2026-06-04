"use client";

import { useState, useEffect, useCallback } from "react";

interface GiphyGif {
  id: string;
  images: {
    fixed_height_small: { url: string; width: string; height: string };
  };
}

const PAGE_SIZE = 12;

interface Props {
  onSelect: (gifUrl: string) => void;
  selectedUrl?: string;
}

export default function GiphyPicker({ onSelect, selectedUrl }: Props) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    setPage(0);
    const res = await fetch(`/api/giphy/search?q=${encodeURIComponent(q)}&limit=36`);
    const data = await res.json();
    setGifs(data?.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => { search(""); }, [search]);

  const totalPages = Math.ceil(gifs.length / PAGE_SIZE);
  const page_items = gifs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search GIFs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      <div className="grid grid-cols-3 gap-2">
        {page_items.map((gif) => {
          const url = gif.images.fixed_height_small.url;
          return (
            <button
              key={gif.id}
              type="button"
              onClick={() => onSelect(url)}
              className={`rounded-lg overflow-hidden border-2 transition focus:outline-none ${
                selectedUrl === url ? "border-indigo-500" : "border-transparent hover:border-gray-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="gif" className="w-full h-auto block" loading="lazy" />
            </button>
          );
        })}
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
      {gifs.length === 0 && !loading && query && (
        <p className="text-sm text-gray-400 text-center">No results for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  );
}
