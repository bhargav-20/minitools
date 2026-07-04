"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";
import { useToolState } from "@/lib/storage";

const SIZE = 140;

function Face({ label, back }: { label: string; back?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 52,
        fontWeight: 600,
        color: "var(--accent-fg)",
        background: "var(--accent)",
        boxShadow: "inset 0 0 0 6px color-mix(in srgb, var(--accent) 70%, #000 30%)",
        backfaceVisibility: "hidden",
        transform: back ? "rotateX(180deg)" : undefined,
      }}
    >
      {label}
    </div>
  );
}

export default function CoinPage() {
  const [rot, setRot] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<"Heads" | "Tails" | null>(null);
  const pending = useRef<"Heads" | "Tails" | null>(null);
  const { value: tally, setValue: setTally, reset } = useToolState("coin", { heads: 0, tails: 0 });

  const flip = useCallback(() => {
    feedback("roll");
    setResult(null);
    setFlipping(true);
    const heads = Math.random() < 0.5;
    pending.current = heads ? "Heads" : "Tails";
    setRot((prev) => {
      let target = prev + 360 * (3 + Math.floor(Math.random() * 3));
      const want = heads ? 0 : 180;
      target += ((want - (target % 360)) + 360) % 360;
      return target;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip]);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-9 py-10">
      <div style={{ perspective: 900, width: SIZE, height: SIZE }}>
        <motion.div
          style={{ position: "relative", width: SIZE, height: SIZE, transformStyle: "preserve-3d" }}
          animate={{ rotateX: rot }}
          transition={{ ...spring.bouncy, mass: 1.2, damping: 14 }}
          onAnimationComplete={() => {
            if (pending.current) {
              const r = pending.current;
              setResult(r);
              feedback("success");
              setTally((t) => ({
                heads: t.heads + (r === "Heads" ? 1 : 0),
                tails: t.tails + (r === "Tails" ? 1 : 0),
              }));
              pending.current = null;
              setFlipping(false);
            }
          }}
        >
          <Face label="H" />
          <Face label="T" back />
        </motion.div>
      </div>

      <div className="flex h-8 items-center">
        {result && (
          <motion.p
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring.bouncy}
            className="text-xl font-semibold"
          >
            {result}
          </motion.p>
        )}
      </div>

      <Button variant="solid" sound={false} onClick={flip} disabled={flipping} className="px-8 py-3 text-base">
        Flip
      </Button>

      <div className="flex items-center gap-6 text-sm text-muted">
        <span>Heads <b className="text-fg tabular">{tally.heads}</b></span>
        <span>Tails <b className="text-fg tabular">{tally.tails}</b></span>
        <button onClick={reset} className="text-subtle hover:text-fg cursor-pointer">
          reset
        </button>
      </div>
      <p className="text-xs text-subtle">Press space to flip</p>
    </div>
  );
}
