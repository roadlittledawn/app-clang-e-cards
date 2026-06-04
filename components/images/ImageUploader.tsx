"use client";

import { useRef, useState } from "react";

interface UploadedImage {
  _id: string;
  s3Key: string;
  url: string;
  filename: string;
}

interface Props {
  onUploaded: (image: UploadedImage) => void;
}

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function ImageUploader({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    if (!ALLOWED.includes(file.type)) { setError("Unsupported file type."); return; }
    if (file.size > MAX_SIZE) { setError("File exceeds 10MB."); return; }

    setUploading(true);
    try {
      const presignRes = await fetch("/api/images/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
      });
      const { url, s3Key, error: presignError } = await presignRes.json();
      if (presignError) { setError(presignError); return; }

      await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      const metaRes = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key, filename: file.name, size: file.size, mimeType: file.type }),
      });
      const image = await metaRes.json();
      onUploaded(image);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition"
      >
        {uploading ? (
          <p className="text-sm text-gray-500">Uploading…</p>
        ) : (
          <p className="text-sm text-gray-500">
            Drop an image here, or <span className="text-indigo-600 font-medium">browse</span>
            <br />
            <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP · max 10MB</span>
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
