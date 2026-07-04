"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Sun, MonitorSmartphone, Volume2, VolumeX, Search, Sparkles } from "lucide-react";
import { useSettings } from "@/lib/theme";
import { spring, tapScale } from "@/lib/motion";
import { getTool } from "@/lib/tools";

function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={tapScale}
      transition={spring.snappy}
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg cursor-pointer"
    >
      {children}
    </motion.button>
  );
}

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, soundOn, cycleMode, toggleSound } = useSettings();
  const isHome = pathname === "/";
  const slug = pathname.replace("/", "");
  const tool = getTool(slug);

  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className="mx-auto flex h-14 max-w-5xl items-center justify-between"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="flex items-center gap-2">
          {isHome ? (
            <Link href="/" className="flex items-center gap-2 font-medium">
              <Sparkles size={18} className="text-accent" />
              <span>Minitools</span>
            </Link>
          ) : (
            <motion.button
              whileTap={tapScale}
              transition={spring.snappy}
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-lg py-1 pr-2 text-sm text-muted hover:text-fg cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span>{tool?.name ?? "Back"}</span>
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Search tools" onClick={onOpenPalette}>
            <Search size={18} />
          </IconButton>
          <IconButton label="Toggle sound" onClick={toggleSound}>
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </IconButton>
          <IconButton label="Toggle theme" onClick={cycleMode}>
            {mode === "light" ? <Sun size={18} /> : mode === "dark" ? <Moon size={18} /> : <MonitorSmartphone size={18} />}
          </IconButton>
        </div>
      </div>
    </header>
  );
}
