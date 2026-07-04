import {
  Hash,
  Dices,
  Coins,
  Shuffle,
  Music2,
  ListChecks,
  Timer,
  Hourglass,
  NotebookPen,
  Palette,
  KeyRound,
  ArrowLeftRight,
  QrCode,
  Wind,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "tactile" | "productivity" | "generators" | "calm";

export interface Tool {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
  category: ToolCategory;
  ready: boolean;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  tactile: "Tactile",
  productivity: "Productivity",
  generators: "Generators",
  calm: "Calm",
};

export const TOOLS: Tool[] = [
  { slug: "counter", name: "Counter", tagline: "Tally with weight", icon: Hash, accent: "#6d5efc", category: "tactile", ready: true },
  { slug: "dice", name: "Dice", tagline: "Roll and tumble", icon: Dices, accent: "#e8544f", category: "tactile", ready: true },
  { slug: "coin", name: "Coin flip", tagline: "Heads or tails", icon: Coins, accent: "#e0a233", category: "tactile", ready: true },
  { slug: "random", name: "Random", tagline: "Slot-machine reels", icon: Shuffle, accent: "#2fa37a", category: "tactile", ready: true },
  { slug: "metronome", name: "Metronome", tagline: "Keep the beat", icon: Music2, accent: "#3b82f6", category: "tactile", ready: true },
  { slug: "todo", name: "To-do", tagline: "Satisfying checks", icon: ListChecks, accent: "#8b5cf6", category: "productivity", ready: true },
  { slug: "pomodoro", name: "Pomodoro", tagline: "Focus in rings", icon: Timer, accent: "#ef4444", category: "productivity", ready: true },
  { slug: "stopwatch", name: "Stopwatch", tagline: "Laps and splits", icon: Hourglass, accent: "#0ea5e9", category: "productivity", ready: true },
  { slug: "scratchpad", name: "Scratchpad", tagline: "Instant notes", icon: NotebookPen, accent: "#f59e0b", category: "productivity", ready: false },
  { slug: "palette", name: "Palette", tagline: "Generate colors", icon: Palette, accent: "#ec4899", category: "generators", ready: true },
  { slug: "password", name: "Password", tagline: "Strong and quick", icon: KeyRound, accent: "#14b8a6", category: "generators", ready: true },
  { slug: "converter", name: "Converter", tagline: "Live unit swaps", icon: ArrowLeftRight, accent: "#6366f1", category: "generators", ready: true },
  { slug: "qr", name: "QR code", tagline: "Draws itself on", icon: QrCode, accent: "#64748b", category: "generators", ready: true },
  { slug: "breathing", name: "Breathing", tagline: "Paced calm", icon: Wind, accent: "#22c55e", category: "calm", ready: true },
  { slug: "tip", name: "Tip split", tagline: "Fast and friendly", icon: Receipt, accent: "#f97316", category: "calm", ready: true },
];

export const READY_TOOLS = TOOLS.filter((t) => t.ready);

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
