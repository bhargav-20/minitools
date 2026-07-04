"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Minus, Plus } from "lucide-react";
import { spring } from "@/lib/motion";

const MIN = 40;
const MAX = 240;
const SWING = 26;

export default function MetronomePage() {
  const [bpm, setBpm] = useState(100);
  const [beats, setBeats] = useState(4);
  const [running, setRunning] = useState(false);
  const [displayBeat, setDisplayBeat] = useState(-1);
  const [dir, setDir] = useState(1);

  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beats);
  const ctxRef = useRef<AudioContext | null>(null);
  const nextNote = useRef(0);
  const beatIdx = useRef(0);
  const queue = useRef<{ beat: number; time: number }[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const raf = useRef<number>(0);
  const taps = useRef<number[]>([]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    beatsRef.current = beats;
  }, [beats]);

  const click = (time: number, accent: boolean) => {
    const ctx = ctxRef.current!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = accent ? 1600 : 1000;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(accent ? 0.5 : 0.32, time + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    o.connect(g).connect(ctx.destination);
    o.start(time);
    o.stop(time + 0.06);
  };

  const start = () => {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = ctxRef.current || new Ctor();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();
    beatIdx.current = 0;
    nextNote.current = ctx.currentTime + 0.06;
    queue.current = [];
    setRunning(true);

    timer.current = setInterval(() => {
      const c = ctxRef.current!;
      while (nextNote.current < c.currentTime + 0.1) {
        const accent = beatIdx.current === 0;
        click(nextNote.current, accent);
        queue.current.push({ beat: beatIdx.current, time: nextNote.current });
        nextNote.current += 60 / bpmRef.current;
        beatIdx.current = (beatIdx.current + 1) % beatsRef.current;
      }
    }, 25);

    const visual = () => {
      const c = ctxRef.current;
      if (c) {
        while (queue.current.length && queue.current[0].time <= c.currentTime) {
          const { beat } = queue.current.shift()!;
          setDisplayBeat(beat);
          setDir((d) => -d);
        }
      }
      raf.current = requestAnimationFrame(visual);
    };
    raf.current = requestAnimationFrame(visual);
  };

  const stop = () => {
    setRunning(false);
    setDisplayBeat(-1);
    if (timer.current) clearInterval(timer.current);
    cancelAnimationFrame(raf.current);
  };

  useEffect(() => () => stop(), []);

  const tap = () => {
    const now = performance.now();
    taps.current = [...taps.current, now].filter((t) => now - t < 2500).slice(-5);
    if (taps.current.length >= 2) {
      const gaps = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      setBpm(Math.min(MAX, Math.max(MIN, Math.round(60000 / avg))));
    }
  };

  const nudge = (d: number) => setBpm((b) => Math.min(MAX, Math.max(MIN, b + d)));

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-8 py-10">
      <div className="relative flex h-44 w-44 items-end justify-center">
        <motion.div
          className="absolute bottom-3 h-36 w-1.5 origin-bottom rounded-full"
          style={{ background: "var(--accent)" }}
          animate={{ rotate: running ? dir * SWING : 0 }}
          transition={running ? { duration: 60 / bpm, ease: "easeInOut" } : spring.soft}
        >
          <span className="absolute -top-1 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full" style={{ background: "var(--accent)" }} />
        </motion.div>
        <span className="absolute bottom-2 h-4 w-4 rounded-full bg-fg" />
      </div>

      <div className="flex flex-col items-center">
        <span className="text-7xl font-semibold tabular">{bpm}</span>
        <span className="text-sm text-muted">BPM</span>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => nudge(-1)} aria-label="Slower" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-surface cursor-pointer">
          <Minus size={18} />
        </button>
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-48"
        />
        <button onClick={() => nudge(1)} aria-label="Faster" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-surface cursor-pointer">
          <Plus size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {Array.from({ length: beats }, (_, i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full transition-colors"
            style={{
              background: displayBeat === i ? (i === 0 ? "var(--accent)" : "var(--text)") : "var(--border-strong)",
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-full border border-border bg-surface p-1">
        <span className="pl-3 text-sm text-muted">Beats</span>
        {[2, 3, 4, 6].map((b) => (
          <button
            key={b}
            onClick={() => setBeats(b)}
            className={`h-8 w-8 rounded-full text-sm font-medium cursor-pointer ${beats === b ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2"}`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          onClick={running ? stop : start}
          aria-label={running ? "Stop" : "Start"}
          className="flex h-20 w-20 items-center justify-center rounded-full text-accent-fg shadow-sm"
          style={{ background: "var(--accent)" }}
        >
          {running ? <Pause size={30} /> : <Play size={30} className="ml-1" />}
        </motion.button>
        <button onClick={tap} className="rounded-full border border-border-strong bg-surface px-6 py-3 text-sm font-medium cursor-pointer active:scale-95">
          Tap
        </button>
      </div>
    </div>
  );
}
