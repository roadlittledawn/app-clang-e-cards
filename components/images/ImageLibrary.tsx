"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LibraryImage {
  _id: string;
  url: string;
  filename: string;
}

interface Props {
  onSelect: (image: LibraryImage) => void;
  selectedId?: string;
}

export default function ImageLibrary({ onSelect, selectedId }: Props) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setImages(data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-400 py-4">Loading library…</p>;
  if (images.length === 0) return <p className="text-sm text-gray-400 py-4">No images uploaded yet.</p>;

  return (
    <div className="grid grid-cols-4 gap-2">
      {images.map((img) => (
        <button
          key={img._id}
          onClick={() => onSelect(img)}
          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
            selectedId === img._id ? "border-indigo-500" : "border-transparent hover:border-gray-300"
          }`}
        >
          <Image src={img.url} alt={img.filename} fill className="object-cover" sizes="96px" />
        </button>
      ))}
    </div>
  );
}
