"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Copy, Check, Eye, EyeOff } from "lucide-react";
import { useToolState } from "@/lib/storage";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "!@#$%^&*()-_=+[]{};:,.?",
};
type SetKey = keyof typeof SETS;
const LABELS: Record<SetKey, string> = { lower: "a-z", upper: "A-Z", number: "0-9", symbol: "!@#" };

function randomFrom(pool: string, len: number) {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (x) => pool[x % pool.length]).join("");
}

export default function PasswordPage() {
  const { value: opts, setValue: setOpts } = useToolState("password-opts", {
    length: 16,
    lower: true,
    upper: true,
    number: true,
    symbol: true,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(false);

  const generate = useCallback(() => {
    const keys = (Object.keys(SETS) as SetKey[]).filter((k) => opts[k]);
    const active = keys.length ? keys : (["lower"] as SetKey[]);
    const pool = active.map((k) => SETS[k]).join("");
    setPassword(randomFrom(pool, opts.length));
  }, [opts]);

  useEffect(() => {
    generate();
  }, [generate]);

  const regen = () => {
    feedback("pop");
    generate();
  };

  const copy = () => {
    navigator.clipboard?.writeText(password);
    feedback("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  const activeCount = (Object.keys(SETS) as SetKey[]).filter((k) => opts[k]).length || 1;
  const poolSize = (Object.keys(SETS) as SetKey[]).reduce((n, k) => n + (opts[k] ? SETS[k].length : 0), 0) || 26;
  const bits = opts.length * Math.log2(poolSize);
  const level = bits < 45 ? 0 : bits < 65 ? 1 : bits < 90 ? 2 : 3;
  const LEVELS = [
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Good", color: "#3b82f6" },
    { label: "Strong", color: "#22c55e" },
  ];

  const toggle = (k: SetKey) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-xl flex-col justify-center gap-6 py-10">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <motion.p
            key={password}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="flex-1 break-all font-mono text-xl leading-relaxed transition-[filter] duration-300"
            style={{ filter: hidden ? "blur(8px)" : "none" }}
          >
            {password || "…"}
          </motion.p>
          <div className="flex shrink-0 gap-1">
            <button onClick={() => setHidden((h) => !h)} aria-label={hidden ? "Reveal" : "Hide"} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg cursor-pointer">
              {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <motion.button whileTap={{ scale: 0.9 }} transition={spring.snappy} onClick={regen} aria-label="Regenerate" className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg cursor-pointer">
              <RefreshCw size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">Strength</span>
          <span className="font-medium" style={{ color: LEVELS[level].color }}>{LEVELS[level].label}</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-2 flex-1 rounded-full"
              animate={{ backgroundColor: i <= level ? LEVELS[level].color : "var(--border)" }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">Length</span>
        <input type="range" min={6} max={40} value={opts.length} onChange={(e) => setOpts((o) => ({ ...o, length: Number(e.target.value) }))} className="flex-1" />
        <span className="w-8 text-right font-medium tabular">{opts.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(SETS) as SetKey[]).map((k) => (
          <button
            key={k}
            onClick={() => toggle(k)}
            disabled={opts[k] && activeCount === 1}
            className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
            style={{
              borderColor: opts[k] ? "var(--accent)" : "var(--border)",
              background: opts[k] ? "var(--accent-soft)" : "transparent",
              color: opts[k] ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {opts[k] && <Check size={15} />} {LABELS[k]}
          </button>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.98 }} transition={spring.snappy} onClick={copy} className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-accent-fg cursor-pointer">
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "Copied" : "Copy password"}
      </motion.button>
    </div>
  );
}
