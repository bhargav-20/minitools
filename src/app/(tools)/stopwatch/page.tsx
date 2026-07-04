"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";

function fmt(ms: number) {
  const cs = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000);
  const p = (n: number) => n.toString().padStart(2, "0");
  return { main: `${m}:${p(s)}`, cs: p(cs) };
}

interface Lap {
  n: number;
  split: number;
  total: number;
}

export default function StopwatchPage() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const raf = useRef<number>(0);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    base.current = performance.now() - elapsed;
    const tick = () => {
      setElapsed(performance.now() - base.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const toggle = () => {
    feedback(running ? "tick" : "pop");
    setRunning((r) => !r);
  };

  const lap = () => {
    feedback("tick");
    const prevTotal = laps.reduce((a, l) => a + l.split, 0);
    setLaps((prev) => [{ n: prev.length + 1, split: elapsed - prevTotal, total: elapsed }, ...prev]);
  };

  const reset = () => {
    feedback("pop");
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const t = fmt(elapsed);
  const splits = laps.map((l) => l.split);
  const fastest = splits.length > 1 ? Math.min(...splits) : -1;
  const slowest = splits.length > 1 ? Math.max(...splits) : -1;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center gap-8 py-12">
      <div className="mt-6 flex items-baseline tabular">
        <span className="text-[clamp(3.5rem,16vw,7rem)] font-semibold leading-none">{t.main}</span>
        <span className="ml-1 w-[1.4em] text-[clamp(1.75rem,7vw,3rem)] font-medium text-muted">.{t.cs}</span>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          onClick={running ? lap : reset}
          disabled={!running && elapsed === 0}
          aria-label={running ? "Lap" : "Reset"}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-border-strong bg-surface text-fg disabled:opacity-40 cursor-pointer"
        >
          {running ? <Flag size={22} /> : <RotateCcw size={22} />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          onClick={toggle}
          aria-label={running ? "Stop" : "Start"}
          className="flex h-20 w-20 items-center justify-center rounded-full text-accent-fg shadow-sm"
          style={{ background: "var(--accent)" }}
        >
          {running ? <Pause size={30} /> : <Play size={30} className="ml-1" />}
        </motion.button>
      </div>

      <div className="w-full max-w-md flex-1">
        <AnimatePresence initial={false}>
          {laps.map((l) => (
            <motion.div
              key={l.n}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={spring.soft}
              className="flex items-center justify-between border-b border-border py-3 text-[15px] tabular"
            >
              <span className="text-muted">Lap {l.n}</span>
              <span
                className="font-medium"
                style={{
                  color:
                    l.split === fastest ? "#22c55e" : l.split === slowest ? "#ef4444" : "var(--text)",
                }}
              >
                {fmt(l.split).main}.{fmt(l.split).cs}
              </span>
              <span className="text-subtle">{fmt(l.total).main}.{fmt(l.total).cs}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
