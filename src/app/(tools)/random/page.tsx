"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { feedback } from "@/lib/sound";
import { useToolState } from "@/lib/storage";

const H = 84;
const CYCLES = 5;

function Reel({ target, delay, nonce }: { target: number; delay: number; nonce: number }) {
  const total = CYCLES * 10 + target;
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-surface tabular"
      style={{ height: H, width: 60 }}
    >
      <motion.div
        key={nonce}
        initial={{ y: 0 }}
        animate={{ y: -total * H }}
        transition={{ duration: 1.3 + delay, delay, ease: [0.1, 0.6, 0.2, 1] }}
        onAnimationComplete={() => feedback("tick")}
        className="absolute inset-x-0 top-0 flex flex-col items-center"
      >
        {Array.from({ length: total + 1 }, (_, i) => (
          <span key={i} className="flex items-center justify-center font-semibold" style={{ height: H, fontSize: 44 }}>
            {i % 10}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function RandomPage() {
  const { value: range, setValue: setRange } = useToolState("random-range", { min: 1, max: 100 });
  const [result, setResult] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);
  const [rolling, setRolling] = useState(false);

  const roll = useCallback(() => {
    const min = Math.min(range.min, range.max);
    const max = Math.max(range.min, range.max);
    const n = min + Math.floor(Math.random() * (max - min + 1));
    feedback("roll");
    setResult(n);
    setNonce((x) => x + 1);
    setRolling(true);
    const digits = Math.max(String(max).length, String(n).length);
    setTimeout(() => setRolling(false), 1300 + digits * 90 + 100);
  }, [range]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        roll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roll]);

  const width = Math.max(String(Math.max(range.min, range.max)).length, result ? String(result).length : 1);
  const digits = result !== null ? String(result).padStart(width, "0").split("").map(Number) : Array(width).fill(0);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-10 py-10">
      <div className="flex gap-2">
        {digits.map((d, i) => (
          <Reel key={i} target={d} delay={i * 0.09} nonce={nonce} />
        ))}
      </div>

      <div className="flex items-center gap-3 text-sm text-muted">
        <label className="flex items-center gap-2">
          min
          <input
            type="number"
            value={range.min}
            onChange={(e) => setRange((r) => ({ ...r, min: Number(e.target.value) }))}
            className="w-20 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-fg outline-none focus:border-border-strong"
          />
        </label>
        <label className="flex items-center gap-2">
          max
          <input
            type="number"
            value={range.max}
            onChange={(e) => setRange((r) => ({ ...r, max: Number(e.target.value) }))}
            className="w-20 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-fg outline-none focus:border-border-strong"
          />
        </label>
      </div>

      <Button variant="solid" sound={false} onClick={roll} disabled={rolling} className="px-8 py-3 text-base">
        Generate
      </Button>
      <p className="text-xs text-subtle">Press space to generate</p>
    </div>
  );
}
