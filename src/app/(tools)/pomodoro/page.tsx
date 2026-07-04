"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";

type Mode = "focus" | "break";
const FOCUS_PRESETS = [15, 25, 50];
const BREAK_FOR: Record<number, number> = { 15: 3, 25: 5, 50: 10 };
const R = 130;
const C = 2 * Math.PI * R;

function alarm() {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    [0, 0.18, 0.36].forEach((d, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 660 + i * 220;
      g.gain.setValueAtTime(0, ctx.currentTime + d);
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + d);
      o.stop(ctx.currentTime + d + 0.18);
    });
    setTimeout(() => ctx.close(), 700);
  } catch {
    /* no audio */
  }
}

export default function PomodoroPage() {
  const [focusMin, setFocusMin] = useState(25);
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const raf = useRef<number>(0);
  const endTs = useRef(0);

  const duration = (mode === "focus" ? focusMin : BREAK_FOR[focusMin]) * 60;
  const color = mode === "focus" ? "var(--accent)" : "#22c55e";

  const stop = useCallback(() => {
    setRunning(false);
    cancelAnimationFrame(raf.current);
  }, []);

  useEffect(() => {
    if (!running) return;
    endTs.current = performance.now() + remaining * 1000;
    const tick = () => {
      const left = Math.max(0, (endTs.current - performance.now()) / 1000);
      setRemaining(left);
      if (left <= 0) {
        alarm();
        const next: Mode = mode === "focus" ? "break" : "focus";
        setMode(next);
        setRemaining((next === "focus" ? focusMin : BREAK_FOR[focusMin]) * 60);
        setRunning(false);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const setPreset = (m: number) => {
    stop();
    setFocusMin(m);
    setMode("focus");
    setRemaining(m * 60);
  };

  const skip = () => {
    feedback("pop");
    stop();
    const next: Mode = mode === "focus" ? "break" : "focus";
    setMode(next);
    setRemaining((next === "focus" ? focusMin : BREAK_FOR[focusMin]) * 60);
  };

  const reset = () => {
    feedback("pop");
    stop();
    setRemaining(duration);
  };

  const progress = duration > 0 ? remaining / duration : 0;
  const mm = Math.floor(remaining / 60);
  const ss = Math.floor(remaining % 60);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-9 py-10">
      <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
        {FOCUS_PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => setPreset(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer ${
              focusMin === m ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
        <svg width={300} height={300} className="-rotate-90">
          <circle cx={150} cy={150} r={R} fill="none" stroke="var(--border)" strokeWidth={12} />
          <motion.circle
            cx={150}
            cy={150}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - progress) }}
            transition={{ duration: 0.2, ease: "linear" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-semibold tabular">
            {mm}:{ss.toString().padStart(2, "0")}
          </span>
          <span className="mt-1 text-sm font-medium uppercase tracking-wider" style={{ color }}>
            {mode === "focus" ? "Focus" : "Break"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          onClick={reset}
          aria-label="Reset"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-surface text-fg cursor-pointer"
        >
          <RotateCcw size={20} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          onClick={() => {
            feedback(running ? "tick" : "pop");
            setRunning((r) => !r);
          }}
          aria-label={running ? "Pause" : "Start"}
          className="flex h-20 w-20 items-center justify-center rounded-full text-accent-fg shadow-sm"
          style={{ background: color }}
        >
          {running ? <Pause size={30} /> : <Play size={30} className="ml-1" />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          onClick={skip}
          aria-label="Skip"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-surface text-fg cursor-pointer"
        >
          <SkipForward size={20} />
        </motion.button>
      </div>
    </div>
  );
}
