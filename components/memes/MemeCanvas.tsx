"use client";

import { useRef, useState, useEffect } from "react";

interface Template { id: string; name: string; url: string; width: number; height: number }

interface Props {
  template: Template;
  onGenerated: (s3Key: string, dataUrl: string) => void;
}

export default function MemeCanvas({ template, onGenerated }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = template.url;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      if (!caption) return;

      const fontSize = Math.max(24, Math.floor(img.height * 0.07));
      ctx.font = `bold ${fontSize}px Impact, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = fontSize / 8;

      const x = img.width / 2;
      const y = img.height - fontSize * 0.4;
      ctx.strokeText(caption, x, y);
      ctx.fillText(caption, x, y);
    };
  }, [template, caption]);

  async function handleUse() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUploading(true);
    setError("");
    try {
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      const filename = `meme-${template.id}.png`;

      const presignRes = await fetch("/api/images/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, mimeType: "image/png", size: blob.size }),
      });
      const { url, s3Key, error: presignError } = await presignRes.json();
      if (presignError) { setError(presignError); return; }

      await fetch(url, { method: "PUT", body: blob, headers: { "Content-Type": "image/png" } });

      await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key, filename, size: blob.size, mimeType: "image/png" }),
      });

      onGenerated(s3Key, canvas.toDataURL("image/png"));
    } catch {
      setError("Failed to save meme. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="w-full rounded-lg border border-gray-200" />
      <input
        type="text"
        placeholder="Add caption…"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="button"
        onClick={handleUse}
        disabled={uploading}
        className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {uploading ? "Saving…" : "Use this meme"}
      </button>
    </div>
  );
}
