import type { Transition } from "framer-motion";

export const spring = {
  snappy: { type: "spring", stiffness: 500, damping: 32, mass: 0.8 },
  soft: { type: "spring", stiffness: 210, damping: 26 },
  bouncy: { type: "spring", stiffness: 420, damping: 12, mass: 0.9 },
  gentle: { type: "spring", stiffness: 120, damping: 20 },
} satisfies Record<string, Transition>;

export const ease = {
  out: [0.22, 0.75, 0.25, 1] as const,
  overshoot: [0.2, 0.75, 0.25, 1.25] as const,
};

export const tapScale = { scale: 0.94 };
export const hoverLift = { y: -3 };
