"use client";

import { useEffect } from "react";
import { createRoot } from "react-dom/client";

const LEAF_COLORS = ["#86efac", "#4ade80", "#bbf7d0", "#fde68a", "#fed7aa", "#fca5a5"];
const COUNT = 18;

function LeafLayer() {
  const leaves = Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: LEAF_COLORS[i % LEAF_COLORS.length],
    delay: `${(Math.random() * 3).toFixed(1)}s`,
    duration: `${4 + Math.random() * 3}s`,
    size: 12 + Math.floor(Math.random() * 12),
    rotate: Math.floor(Math.random() * 360),
  }));

  return (
    <>
      <style>{`
        @keyframes leaf-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          25%  { transform: translateY(25vh) translateX(30px) rotate(90deg); }
          50%  { transform: translateY(50vh) translateX(-20px) rotate(180deg); }
          75%  { transform: translateY(75vh) translateX(25px) rotate(270deg); }
          100% { transform: translateY(110vh) translateX(-10px) rotate(360deg); opacity: 0; }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
        {leaves.map((leaf) => (
          <div
            key={leaf.id}
            style={{
              position: "absolute",
              top: "-20px",
              left: leaf.left,
              animation: `leaf-fall ${leaf.duration} ${leaf.delay} ease-in forwards`,
            }}
          >
            <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24">
              <path
                d="M12 2 C6 2 2 8 2 12 C2 18 8 22 12 22 C16 22 22 18 22 12 C22 6 18 2 12 2 Z"
                fill={leaf.color}
                transform={`rotate(${leaf.rotate} 12 12)`}
              />
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
  root.render(<LeafLayer />);
  setTimeout(() => {
    root.unmount();
    document.body.removeChild(container);
  }, 10000);
}
