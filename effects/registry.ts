export type EffectName = "confetti" | "balloons" | "leaves";

export interface EffectModule {
  play: () => void | Promise<void>;
}

export const effectRegistry: Record<EffectName, () => Promise<EffectModule>> = {
  confetti: () => import("./confetti"),
  balloons: () => import("./balloons"),
  leaves: () => import("./leaves"),
};

export function isValidEffect(name: string): name is EffectName {
  return name in effectRegistry;
}
