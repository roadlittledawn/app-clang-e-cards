"use client";

import { createRoot } from "react-dom/client";

const LEAF_COLORS = ["#4ade80", "#86efac", "#16a34a", "#bbf7d0", "#a3e635", "#65a30d"];
const COUNT = 20;

function LeafShape({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 20 28" fill="none">
      {/* Pointed oval leaf shape */}
      <path
        d="M10 1 C15 4 18 9 18 14 C18 20 14 26 10 27 C6 26 2 20 2 14 C2 9 5 4 10 1 Z"
        fill={color}
        opacity="0.9"
      />
      {/* Midrib */}
      <line x1="10" y1="2" x2="10" y2="26" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
    </svg>
  );
}

function LeafLayer() {
  const leaves = Array.from({ length: COUNT }, (_, i) => {
    const duration = 4 + Math.random() * 4;
    const waveHeight = 20 + Math.random() * 40;
    const spinDeg = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);
    return {
      id: i,
      top: `${10 + Math.random() * 80}%`,
      color: LEAF_COLORS[i % LEAF_COLORS.length],
      delay: `${(Math.random() * 5).toFixed(2)}s`,
      duration: `${duration.toFixed(2)}s`,
      waveDuration: `${(duration * 0.4 + Math.random() * 0.8).toFixed(2)}s`,
      size: 14 + Math.floor(Math.random() * 14),
      waveHeight,
      spinDeg,
    };
  });

  return (
    <>
      <style>{`
        @keyframes leaf-blow {
          from { transform: translateX(-80px); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          to   { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes leaf-wave-up {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(var(--wave)) rotate(var(--half-spin)); }
          100% { transform: translateY(0px) rotate(var(--full-spin)); }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
        {leaves.map((leaf) => (
          /* Outer: horizontal blow left→right */
          <div
            key={leaf.id}
            style={{
              position: "absolute",
              left: "-80px",
              top: leaf.top,
              animation: `leaf-blow ${leaf.duration} ${leaf.delay} linear forwards`,
            }}
          >
            {/* Inner: vertical wave + spin */}
            <div
              style={{
                animation: `leaf-wave-up ${leaf.waveDuration} ease-in-out infinite`,
                ["--wave" as string]: `${leaf.waveHeight}px`,
                ["--half-spin" as string]: `${leaf.spinDeg / 2}deg`,
                ["--full-spin" as string]: `${leaf.spinDeg}deg`,
              }}
            >
              <LeafShape color={leaf.color} size={leaf.size} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function play(): void {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<LeafLayer />);
  setTimeout(() => {
    root.unmount();
    document.body.removeChild(container);
  }, 12000);
}
