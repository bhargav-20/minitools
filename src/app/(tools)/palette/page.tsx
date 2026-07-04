"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LockOpen, Check, Copy } from "lucide-react";
import { useToolState } from "@/lib/storage";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";

interface Swatch {
  hex: string;
  locked: boolean;
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (n: number) =>
    Math.round(255 * f(n))
      .toString(16)
      .padStart(2, "0");
  return `#${to(0)}${to(8)}${to(4)}`.toUpperCase();
}

const LIGHT = [74, 62, 50, 39, 29];
const HUE_OFFSET = [-38, -18, 0, 20, 42];

function scheme(): string[] {
  const base = Math.random() * 360;
  const sat = 58 + Math.random() * 16;
  return LIGHT.map((l, i) => hslToHex((base + HUE_OFFSET[i] + 360) % 360, sat, l));
}

function isDark(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
}

const DEFAULT: Swatch[] = ["#A7C7E7", "#6D82E0", "#4A34C9", "#5F21A6", "#7B1E86"].map((hex) => ({
  hex,
  locked: false,
}));

export default function PalettePage() {
  const { value: palette, setValue: setPalette } = useToolState<Swatch[]>("palette", DEFAULT);
  const [copied, setCopied] = useState(-1);

  const generate = useCallback(() => {
    feedback("pop");
    const next = scheme();
    setPalette((prev) => prev.map((s, i) => (s.locked ? s : { hex: next[i], locked: false })));
  }, [setPalette]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate]);

  const copy = (hex: string, i: number) => {
    navigator.clipboard?.writeText(hex);
    feedback("tick");
    setCopied(i);
    setTimeout(() => setCopied(-1), 1100);
  };

  const toggleLock = (i: number) =>
    setPalette((prev) => prev.map((s, idx) => (idx === i ? { ...s, locked: !s.locked } : s)));

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-1 flex-col sm:flex-row">
        {palette.map((s, i) => {
          const dark = isDark(s.hex);
          const fg = dark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.82)";
          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col items-center justify-end gap-4 py-8"
              style={{ background: s.hex, color: fg }}
            >
              <button
                onClick={() => toggleLock(i)}
                aria-label={s.locked ? "Unlock" : "Lock"}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                style={{ background: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)" }}
              >
                {s.locked ? <Lock size={16} /> : <LockOpen size={16} />}
              </button>
              <button
                onClick={() => copy(s.hex, i)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-lg font-semibold tracking-wide tabular cursor-pointer"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied === i ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={spring.bouncy}
                      className="flex items-center gap-1.5"
                    >
                      <Check size={17} /> Copied
                    </motion.span>
                  ) : (
                    <motion.span key="hex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                      {s.hex}
                      <Copy size={14} className="opacity-0 transition-opacity group-hover:opacity-60" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-border py-4">
        <button
          onClick={generate}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg cursor-pointer active:scale-95"
        >
          Generate
        </button>
        <span className="text-xs text-subtle">or press space · tap the lock to keep a color</span>
      </div>
    </div>
  );
}
