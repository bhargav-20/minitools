"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import { useToolState } from "@/lib/storage";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";

type Unit = { sym: string; factor: number };
const CATS: Record<string, { units: Unit[]; temp?: boolean }> = {
  Length: {
    units: [
      { sym: "m", factor: 1 },
      { sym: "km", factor: 1000 },
      { sym: "cm", factor: 0.01 },
      { sym: "mm", factor: 0.001 },
      { sym: "mi", factor: 1609.344 },
      { sym: "ft", factor: 0.3048 },
      { sym: "in", factor: 0.0254 },
      { sym: "yd", factor: 0.9144 },
    ],
  },
  Mass: {
    units: [
      { sym: "kg", factor: 1 },
      { sym: "g", factor: 0.001 },
      { sym: "mg", factor: 1e-6 },
      { sym: "lb", factor: 0.453592 },
      { sym: "oz", factor: 0.0283495 },
      { sym: "t", factor: 1000 },
    ],
  },
  Volume: {
    units: [
      { sym: "L", factor: 1 },
      { sym: "mL", factor: 0.001 },
      { sym: "gal", factor: 3.78541 },
      { sym: "qt", factor: 0.946353 },
      { sym: "cup", factor: 0.236588 },
      { sym: "fl oz", factor: 0.0295735 },
    ],
  },
  Temperature: {
    temp: true,
    units: [
      { sym: "°C", factor: 0 },
      { sym: "°F", factor: 0 },
      { sym: "K", factor: 0 },
    ],
  },
};
const CAT_NAMES = Object.keys(CATS);

function toC(v: number, u: string) {
  return u === "°F" ? ((v - 32) * 5) / 9 : u === "K" ? v - 273.15 : v;
}
function fromC(v: number, u: string) {
  return u === "°F" ? (v * 9) / 5 + 32 : u === "K" ? v + 273.15 : v;
}

function convert(value: number, cat: string, from: string, to: string) {
  const c = CATS[cat];
  if (c.temp) return fromC(toC(value, from), to);
  const f = c.units.find((u) => u.sym === from)!.factor;
  const t = c.units.find((u) => u.sym === to)!.factor;
  return (value * f) / t;
}

function fmt(n: number) {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-4 || abs >= 1e9)) return n.toExponential(4);
  return parseFloat(n.toPrecision(7)).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function ConverterPage() {
  const { value: cfg, setValue: setCfg } = useToolState("converter", {
    cat: "Length",
    from: "km",
    to: "mi",
    value: "10",
  });

  const units = CATS[cfg.cat].units;
  const result = useMemo(() => {
    const v = parseFloat(cfg.value);
    if (isNaN(v)) return "";
    return fmt(convert(v, cfg.cat, cfg.from, cfg.to));
  }, [cfg]);

  const setCat = (cat: string) => {
    const u = CATS[cat].units;
    setCfg((c) => ({ ...c, cat, from: u[0].sym, to: u[1].sym }));
  };
  const swap = () => {
    feedback("pop");
    setCfg((c) => ({ ...c, from: c.to, to: c.from }));
  };

  const selectCls =
    "rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium outline-none focus:border-border-strong cursor-pointer";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-lg flex-col justify-center gap-6 py-10">
      <div className="flex flex-wrap justify-center gap-2">
        {CAT_NAMES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer ${
              cfg.cat === c ? "bg-accent text-accent-fg" : "border border-border text-muted hover:bg-surface-2"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <label className="text-xs text-muted">From</label>
        <div className="mt-1 flex gap-2">
          <input
            type="number"
            value={cfg.value}
            onChange={(e) => setCfg((c) => ({ ...c, value: e.target.value }))}
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-lg font-medium outline-none focus:border-border-strong"
          />
          <select value={cfg.from} onChange={(e) => setCfg((c) => ({ ...c, from: e.target.value }))} className={selectCls}>
            {units.map((u) => (
              <option key={u.sym} value={u.sym}>{u.sym}</option>
            ))}
          </select>
        </div>

        <div className="my-3 flex justify-center">
          <motion.button whileTap={{ scale: 0.85, rotate: 180 }} transition={spring.snappy} onClick={swap} aria-label="Swap units" className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-surface-2 text-muted hover:text-fg cursor-pointer">
            <ArrowUpDown size={18} />
          </motion.button>
        </div>

        <label className="text-xs text-muted">To</label>
        <div className="mt-1 flex gap-2">
          <div className="flex w-full items-center rounded-xl border border-border bg-surface-2 px-3 py-2.5">
            <motion.span key={result} initial={{ opacity: 0.5, y: 3 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-semibold tabular text-accent">
              {result || "—"}
            </motion.span>
          </div>
          <select value={cfg.to} onChange={(e) => setCfg((c) => ({ ...c, to: e.target.value }))} className={selectCls}>
            {units.map((u) => (
              <option key={u.sym} value={u.sym}>{u.sym}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
