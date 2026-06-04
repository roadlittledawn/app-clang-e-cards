"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EffectPicker from "./EffectPicker";
import ImageUploader from "@/components/images/ImageUploader";
import ImageLibrary from "@/components/images/ImageLibrary";
import GiphyPicker from "@/components/giphy/GiphyPicker";
import MemePicker from "@/components/memes/MemePicker";
import type { EffectType, ICardImage } from "@/models/Card";

type ImageMode = "upload" | "giphy" | "meme";
type Tab = "upload" | "library" | "giphy" | "meme";

interface InitialValues {
  id?: string;
  title?: string;
  message?: string;
  recipientName?: string;
  image?: ICardImage & { previewUrl?: string };
  effect?: EffectType;
}

export default function CardForm({ initial }: { initial?: InitialValues }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [recipientName, setRecipientName] = useState(initial?.recipientName ?? "");
  const [effect, setEffect] = useState<EffectType | "none">(initial?.effect ?? "none");
  const [imageTab, setImageTab] = useState<Tab>("upload");
  const [cardImage, setCardImage] = useState<(ICardImage & { previewUrl?: string }) | null>(
    initial?.image ?? null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setUploadedImage(img: { _id: string; s3Key: string; url: string }) {
    setCardImage({ mode: "upload", imageId: img._id as unknown as ICardImage["imageId"], s3Key: img.s3Key, previewUrl: img.url });
  }

  function setGiphyImage(url: string) {
    setCardImage({ mode: "giphy", giphyUrl: url, previewUrl: url });
  }

  function setMemeImage(s3Key: string, dataUrl: string) {
    setCardImage({ mode: "meme", s3Key, previewUrl: dataUrl });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const imagePayload = cardImage ? {
      mode: cardImage.mode as ImageMode,
      imageId: cardImage.imageId,
      giphyUrl: cardImage.giphyUrl,
      s3Key: cardImage.s3Key,
    } : undefined;

    const body = {
      title,
      message,
      recipientName,
      effect: effect === "none" ? undefined : effect,
      image: imagePayload,
    };

    const url = initial?.id ? `/api/cards/${initial.id}` : "/api/cards";
    const method = initial?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error ?? "Failed to save card."); return; }
    router.push("/dashboard");
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "upload", label: "Upload" },
    { id: "library", label: "My Library" },
    { id: "giphy", label: "GIF" },
    { id: "meme", label: "Meme" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <Field label="Title" required>
          <input
            required value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </Field>
        <Field label="Recipient name" required>
          <input
            required value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </Field>
        <Field label="Message" required>
          <textarea
            required rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </Field>
      </div>

      <Field label="Image (optional)">
        <div className="flex gap-2 mb-3">
          {TABS.map((tab) => (
            <button
              key={tab.id} type="button" onClick={() => setImageTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                imageTab === tab.id ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600 hover:border-indigo-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {cardImage?.previewUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
            <Image src={cardImage.previewUrl} alt="Preview" fill className="object-contain" sizes="480px" unoptimized={cardImage.mode === "giphy"} />
            <button
              type="button" onClick={() => setCardImage(null)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-black/70"
            >
              ×
            </button>
          </div>
        )}

        {imageTab === "upload" && <ImageUploader onUploaded={setUploadedImage} />}
        {imageTab === "library" && <ImageLibrary onSelect={(img) => setCardImage({ mode: "upload", imageId: img._id as unknown as ICardImage["imageId"], previewUrl: img.url })} selectedId={cardImage?.imageId?.toString()} />}
        {imageTab === "giphy" && <GiphyPicker onSelect={setGiphyImage} selectedUrl={cardImage?.giphyUrl} />}
        {imageTab === "meme" && <MemePicker onGenerated={setMemeImage} />}
      </Field>

      <Field label="Effect">
        <EffectPicker value={effect} onChange={setEffect} />
      </Field>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit" disabled={saving}
        className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving…" : initial?.id ? "Save changes" : "Create card"}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
