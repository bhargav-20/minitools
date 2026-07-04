"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { spring } from "@/lib/motion";
import type { Tool } from "@/lib/tools";

export function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const Icon = tool.icon;
  const body = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.soft, delay: Math.min(index * 0.035, 0.4) }}
      whileHover={tool.ready ? { y: -4 } : undefined}
      whileTap={tool.ready ? { scale: 0.97 } : undefined}
      className={`group relative flex h-full flex-col gap-3 rounded-[var(--radius-tool)] border border-border bg-surface p-5 ${
        tool.ready ? "cursor-pointer hover:border-border-strong hover:shadow-md" : "opacity-55"
      }`}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
        style={{ background: `${tool.accent}1a`, color: tool.accent }}
      >
        <Icon size={22} strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-[15px] font-medium">{tool.name}</h3>
        <p className="text-[13px] text-muted">{tool.tagline}</p>
      </div>
      {!tool.ready && (
        <span className="absolute right-4 top-4 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-subtle">
          soon
        </span>
      )}
    </motion.div>
  );

  if (!tool.ready) return body;
  return (
    <Link href={`/${tool.slug}`} aria-label={tool.name}>
      {body}
    </Link>
  );
}
