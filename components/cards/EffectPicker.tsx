"use client";

import type { EffectType } from "@/models/Card";

const OPTIONS: { value: EffectType | "none"; label: string }[] = [
  { value: "none", label: "None" },
  { value: "confetti", label: "Confetti" },
  { value: "balloons", label: "Balloons" },
  { value: "leaves", label: "Leaves" },
];

interface Props {
  value: EffectType | "none";
  onChange: (v: EffectType | "none") => void;
}

export default function EffectPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
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
