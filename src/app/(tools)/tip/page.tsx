"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useToolState } from "@/lib/storage";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";

const PRESETS = [10, 15, 18, 20, 25];

export default function TipPage() {
  const { value: s, setValue: setS } = useToolState("tip", {
    bill: "60",
    tip: 18,
    people: 2,
    round: false,
  });

  const bill = parseFloat(s.bill) || 0;
  const tipAmt = (bill * s.tip) / 100;
  const total = bill + tipAmt;
  const rawPer = s.people > 0 ? total / s.people : 0;
  const perPerson = s.round ? Math.ceil(rawPer) : rawPer;
  const grand = s.round ? perPerson * s.people : total;

  const money = (n: number) => `$${n.toFixed(2)}`;
  const setPeople = (d: number) => {
    feedback("tick");
    setS((p) => ({ ...p, people: Math.max(1, Math.min(50, p.people + d)) }));
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-md flex-col justify-center gap-6 py-10">
      <div>
        <label className="text-sm text-muted">Bill amount</label>
        <div className="mt-1 flex items-center rounded-2xl border border-border bg-surface px-4">
          <span className="text-2xl font-medium text-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={s.bill}
            onChange={(e) => setS((p) => ({ ...p, bill: e.target.value }))}
            className="w-full bg-transparent py-4 pl-2 text-2xl font-semibold outline-none"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">Tip</span>
          <span className="font-medium text-accent">{s.tip}%</span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setS((c) => ({ ...c, tip: p }))}
              className={`flex-1 rounded-xl py-2 text-sm font-medium cursor-pointer ${
                s.tip === p ? "bg-accent text-accent-fg" : "border border-border text-muted hover:bg-surface-2"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
        <input type="range" min={0} max={30} value={s.tip} onChange={(e) => setS((c) => ({ ...c, tip: Number(e.target.value) }))} className="w-full" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Split between</span>
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} transition={spring.snappy} onClick={() => setPeople(-1)} aria-label="Fewer people" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-surface cursor-pointer">
            <Minus size={18} />
          </motion.button>
          <span className="w-10 text-center text-2xl font-semibold tabular">{s.people}</span>
          <motion.button whileTap={{ scale: 0.9 }} transition={spring.snappy} onClick={() => setPeople(1)} aria-label="More people" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-surface cursor-pointer">
            <Plus size={18} />
          </motion.button>
        </div>
      </div>

      <button
        onClick={() => {
          feedback("pop");
          setS((c) => ({ ...c, round: !c.round }));
        }}
        className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm cursor-pointer"
      >
        <span className="text-muted">Round up per person</span>
        <span
          className="relative h-6 w-10 rounded-full transition-colors"
          style={{ background: s.round ? "var(--accent)" : "var(--border-strong)" }}
        >
          <motion.span layout transition={spring.snappy} className="absolute top-0.5 h-5 w-5 rounded-full bg-white" style={{ [s.round ? "right" : "left"]: 2 }} />
        </span>
      </button>

      <div className="rounded-2xl bg-accent-soft p-5">
        <div className="flex justify-between text-sm text-muted">
          <span>Tip {money(tipAmt)}</span>
          <span>Total {money(grand)}</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm font-medium text-accent">Per person</span>
          <motion.span key={perPerson.toFixed(2)} initial={{ opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-semibold text-accent tabular">
            {money(perPerson)}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
