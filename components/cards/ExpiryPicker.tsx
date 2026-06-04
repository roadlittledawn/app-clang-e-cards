"use client";

import type { ExpiryDays } from "@/lib/share-link";

const OPTIONS: { value: ExpiryDays; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: null, label: "Never" },
];

interface Props {
  value: ExpiryDays;
  onChange: (v: ExpiryDays) => void;
}

export default function ExpiryPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
            value === opt.value
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
