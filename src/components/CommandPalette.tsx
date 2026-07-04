"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { spring } from "@/lib/motion";
import { feedback } from "@/lib/sound";

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? TOOLS.filter((t) => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
      : TOOLS;
    return list;
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const go = (slug: string, ready: boolean) => {
    if (!ready) return;
    feedback("pop");
    setOpen(false);
    router.push(`/${slug}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={spring.soft}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                go(results[active].slug, results[active].ready);
              }
            }}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search size={18} className="text-subtle" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a tool"
                className="w-full bg-transparent py-4 text-base outline-none placeholder:text-subtle"
              />
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">No tools found</p>}
              {results.map((t, i) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.slug}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(t.slug, t.ready)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${
                      i === active ? "bg-surface-2" : ""
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: `${t.accent}1a`, color: t.accent }}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{t.name}</span>
                      <span className="block text-xs text-muted">{t.tagline}</span>
                    </span>
                    {!t.ready && <span className="text-[11px] text-subtle">soon</span>}
                    {i === active && t.ready && <CornerDownLeft size={15} className="text-subtle" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
