"use client";

import { useEffect } from "react";
import { effectRegistry, isValidEffect } from "@/effects/registry";

interface Props {
  effect: string | null;
}

export default function EffectPlayer({ effect }: Props) {
  useEffect(() => {
    if (!effect || !isValidEffect(effect)) return;
    effectRegistry[effect]().then((mod) => mod.play());
  }, [effect]);

  return null;
}
