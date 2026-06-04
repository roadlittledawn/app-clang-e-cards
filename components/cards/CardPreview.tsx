"use client";

import { useEffect } from "react";
import EffectPlayer from "@/components/effects/EffectPlayer";

interface Props {
  title: string;
  message: string;
  recipientName: string;
  effect: string | null;
  imageUrl: string | null;
  onClose: () => void;
}

export default function CardPreview({ title, message, recipientName, effect, imageUrl, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Card preview"
    >
      <EffectPlayer effect={effect} />

      <div
        className="relative w-full max-w-lg bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 rounded-full w-8 h-8 flex items-center justify-center shadow text-lg transition"
          aria-label="Close preview"
        >
          ×
        </button>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="w-full max-h-72 object-contain bg-gray-100" />
        )}

        <div className="p-8 space-y-3">
          <p className="text-sm font-semibold text-indigo-500 tracking-wide uppercase">
            For {recipientName || "…"}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">{title || "Untitled"}</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {message || "Your message will appear here."}
          </p>
          {effect && effect !== "none" && (
            <p className="text-xs text-indigo-400 pt-1">✦ {effect} effect plays on open</p>
          )}
        </div>

        <div className="px-8 pb-5">
          <p className="text-xs text-gray-400 text-center">Preview — click outside or press Esc to close</p>
        </div>
      </div>
    </div>
  );
}
