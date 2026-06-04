import confetti from "canvas-confetti";

export function play(): void {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
  });
}
