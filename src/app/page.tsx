"use client";

import { motion } from "framer-motion";
import { TOOLS, CATEGORY_LABELS, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";

const ORDER: ToolCategory[] = ["tactile", "productivity", "generators", "calm"];

export default function Home() {
  let cardIndex = 0;
  return (
    <div className="py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 max-w-xl"
      >
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">A little bundle of delight</h1>
        <p className="mt-3 text-[15px] text-muted">
          Small tools, obsessively crafted. Every tap answers back. Press{" "}
          <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs">⌘K</kbd> to jump around.
        </p>
      </motion.div>

      {ORDER.map((cat) => {
        const tools = TOOLS.filter((t) => t.category === cat);
        return (
          <section key={cat} className="mb-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-subtle">{CATEGORY_LABELS[cat]}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {tools.map((t) => (
                <ToolCard key={t.slug} tool={t} index={cardIndex++} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
