"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface GiphyGif {
  id: string;
  url: string;
  images: { fixed_height_small: { url: string; width: string; height: string } };
}

interface Props {
  onSelect: (gifUrl: string) => void;
  selectedUrl?: string;
}

export default function GiphyPicker({ onSelect, selectedUrl }: Props) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/giphy/search?q=${encodeURIComponent(q)}&limit=20`);
    const data = await res.json();
    setGifs(data?.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => { search(""); }, [search]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search GIFs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {gifs.map((gif) => {
          const thumb = gif.images.fixed_height_small;
          const gifUrl = gif.images.fixed_height_small.url;
          return (
            <button
              key={gif.id}
              type="button"
              onClick={() => onSelect(gifUrl)}
              className={`relative rounded-lg overflow-hidden border-2 transition ${
                selectedUrl === gifUrl ? "border-indigo-500" : "border-transparent hover:border-gray-300"
              }`}
              style={{ aspectRatio: `${thumb.width}/${thumb.height}` }}
            >
              <Image src={thumb.url} alt="gif" fill className="object-cover" sizes="80px" unoptimized />
            </button>
          );
        })}
      </div>
      {gifs.length === 0 && !loading && query && (
        <p className="text-sm text-gray-400 text-center">No results for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  );
}
