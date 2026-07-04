"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { feedback } from "@/lib/sound";

const PHASES = [
  { label: "Breathe in", dur: 4, scale: 1 },
  { label: "Hold", dur: 7, scale: 1 },
  { label: "Breathe out", dur: 8, scale: 0.55 },
];

export default function BreathingPage() {
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(PHASES[0].dur);

  useEffect(() => {
    if (!running) return;
    setCount(PHASES[idx].dur);
    const interval = setInterval(() => setCount((c) => Math.max(1, c - 1)), 1000);
    const timeout = setTimeout(() => setIdx((i) => (i + 1) % PHASES.length), PHASES[idx].dur * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [running, idx]);

  const phase = PHASES[idx];

  const start = () => {
    feedback("pop");
    setIdx(0);
    setRunning(true);
  };
  const stop = () => {
    feedback("tick");
    setRunning(false);
    setIdx(0);
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-12 py-10">
      <div className="relative flex h-72 w-72 items-center justify-center">
        <motion.div
          className="absolute h-56 w-56 rounded-full"
          style={{ background: "var(--accent)", opacity: 0.12 }}
          animate={{ scale: running ? phase.scale : 0.55 }}
          transition={{ duration: running ? phase.dur : 0.8, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute flex h-40 w-40 items-center justify-center rounded-full"
          style={{ background: "var(--accent)", boxShadow: "0 0 60px 0 var(--accent)" }}
          animate={{ scale: running ? phase.scale : 0.55 }}
          transition={{ duration: running ? phase.dur : 0.8, ease: "easeInOut" }}
        >
          {running && <span className="text-4xl font-semibold text-accent-fg tabular">{count}</span>}
        </motion.div>
      </div>

      <div className="flex h-8 items-center">
        {running && (
          <motion.p
            key={phase.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-medium"
          >
            {phase.label}
          </motion.p>
        )}
      </div>

      <Button variant={running ? "outline" : "solid"} sound={false} onClick={running ? stop : start} className="px-8 py-3 text-base">
        {running ? "Stop" : "Begin"}
      </Button>
      {!running && <p className="text-xs text-subtle">A calming 4-7-8 breath cycle</p>}
    </div>
  );
}
