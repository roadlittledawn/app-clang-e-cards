"use client";

import { useEffect } from "react";
import { createRoot } from "react-dom/client";

const BALLOON_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#f472b6"];
const COUNT = 12;

function BalloonLayer() {
  const balloons = Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    left: `${5 + (i / COUNT) * 90}%`,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    delay: `${(i * 0.3).toFixed(1)}s`,
    duration: `${3 + Math.random() * 2}s`,
    size: 32 + Math.floor(Math.random() * 20),
  }));

  return (
    <>
      <style>{`
        @keyframes balloon-rise {
          0% { transform: translateY(0) rotate(-5deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(5deg); opacity: 0; }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
        {balloons.map((b) => (
          <div
            key={b.id}
            style={{
              position: "absolute",
              bottom: "-60px",
              left: b.left,
              animation: `balloon-rise ${b.duration} ${b.delay} ease-in forwards`,
            }}
          >
            <svg width={b.size} height={b.size * 1.3} viewBox="0 0 40 52" fill="none">
              <ellipse cx="20" cy="20" rx="18" ry="20" fill={b.color} opacity="0.9" />
              <path d="M20 40 Q18 44 20 48 Q22 44 20 40" stroke={b.color} strokeWidth="1.5" fill="none" />
            </svg>
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
  root.render(<BalloonLayer />);
  setTimeout(() => {
    root.unmount();
    document.body.removeChild(container);
  }, 8000);
}
