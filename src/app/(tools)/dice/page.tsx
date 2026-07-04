"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NumberRoll } from "@/components/ui/NumberRoll";
import { Button } from "@/components/ui/Button";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};
const G = ["22%", "50%", "78%"];
const SIZE = 104;
const HALF = SIZE / 2;

const FACES: { value: number; transform: string; bright: number }[] = [
  { value: 1, transform: `rotateY(0deg) translateZ(${HALF}px)`, bright: 0.96 },
  { value: 6, transform: `rotateY(180deg) translateZ(${HALF}px)`, bright: 0.9 },
  { value: 3, transform: `rotateY(90deg) translateZ(${HALF}px)`, bright: 0.8 },
  { value: 4, transform: `rotateY(-90deg) translateZ(${HALF}px)`, bright: 0.84 },
  { value: 2, transform: `rotateX(90deg) translateZ(${HALF}px)`, bright: 1 },
  { value: 5, transform: `rotateX(-90deg) translateZ(${HALF}px)`, bright: 0.7 },
];
const FACEROT: Record<number, [number, number]> = {
  1: [0, 0], 6: [0, 180], 3: [0, -90], 4: [0, 90], 2: [-90, 0], 5: [90, 0],
};

function Die({ nonce, onResult }: { nonce: number; onResult: (v: number) => void }) {
  const [rot, setRot] = useState({ x: -20, y: 24 });
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    if (nonce === 0) return;
    const value = 1 + Math.floor(Math.random() * 6);
    const [rx, ry] = FACEROT[value];
    const sx = 360 * (2 + Math.floor(Math.random() * 3));
    const sy = 360 * (2 + Math.floor(Math.random() * 3));
    setPending(value);
    setRot({ x: rx - sx, y: ry + sy });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  return (
    <div style={{ perspective: 700, width: SIZE, height: SIZE }}>
      <motion.div
        style={{ position: "relative", width: SIZE, height: SIZE, transformStyle: "preserve-3d" }}
        animate={{ rotateX: rot.x, rotateY: rot.y }}
        transition={{ ...spring.bouncy, mass: 1.1 }}
        onAnimationComplete={() => {
          if (pending !== null) {
            onResult(pending);
            setPending(null);
          }
        }}
      >
        {FACES.map((f) => (
          <div
            key={f.value}
            style={{
              position: "absolute",
              width: SIZE,
              height: SIZE,
              transform: f.transform,
              background: `color-mix(in srgb, var(--accent) ${f.bright * 100}%, #000 ${(1 - f.bright) * 55}%)`,
              borderRadius: 16,
              boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.15)",
            }}
          >
            {PIPS[f.value].map(([c, r], i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: G[c],
                  top: G[r],
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  transform: "translate(-50%,-50%)",
                }}
              />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function DicePage() {
  const [count, setCount] = useState(1);
  const [nonce, setNonce] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);

  const roll = useCallback(() => {
    feedback("roll");
    setResults([]);
    setRolling(true);
    setNonce((n) => n + 1);
  }, []);

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

  const report = (v: number) => {
    setResults((prev) => {
      const next = [...prev, v];
      if (next.length === count) setRolling(false);
      return next;
    });
  };

  const total = results.reduce((a, b) => a + b, 0);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-10 py-10">
      <div className="flex flex-wrap items-center justify-center gap-6">
        {Array.from({ length: count }, (_, i) => (
          <Die key={i} nonce={nonce} onResult={report} />
        ))}
      </div>

      <div className="flex h-9 items-center">
        {count > 1 && results.length === count && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold">
            <NumberRoll value={total} />
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border bg-surface p-1">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => {
              setCount(n);
              setResults([]);
            }}
            className={`h-9 w-9 rounded-full text-sm font-medium cursor-pointer ${
              count === n ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <Button variant="solid" sound={false} onClick={roll} disabled={rolling} className="px-8 py-3 text-base">
        Roll
      </Button>
      <p className="text-xs text-subtle">Press space to roll</p>
    </div>
  );
}
