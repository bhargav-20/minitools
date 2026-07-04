"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { spring, tapScale } from "@/lib/motion";
import { feedback } from "@/lib/sound";

type Variant = "solid" | "soft" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  solid: "bg-accent text-accent-fg shadow-sm",
  soft: "bg-accent-soft text-accent",
  ghost: "bg-transparent text-fg hover:bg-surface-2",
  outline: "bg-surface text-fg border border-border-strong hover:bg-surface-2",
};

interface Props extends HTMLMotionProps<"button"> {
  variant?: Variant;
  sound?: boolean;
}

export function Button({ variant = "outline", sound = true, className = "", onClick, children, ...rest }: Props) {
  return (
    <motion.button
      whileTap={tapScale}
      transition={spring.snappy}
      onClick={(e) => {
        if (sound) feedback("pop");
        onClick?.(e);
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium select-none cursor-pointer transition-colors ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
