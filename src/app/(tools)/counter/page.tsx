"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { NumberRoll } from "@/components/ui/NumberRoll";
import { useToolState } from "@/lib/storage";
import { feedback } from "@/lib/sound";
import { spring, tapScale } from "@/lib/motion";

export default function CounterPage() {
  const { value, setValue, reset } = useToolState<number>("counter", 0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeated = useRef(false);

  const step = useCallback(
    (dir: 1 | -1) => {
      feedback("tick");
      setValue((v) => v + dir);
    },
    [setValue]
  );

  const startHold = (dir: 1 | -1) => {
    repeated.current = false;
    holdTimer.current = setTimeout(() => {
      repeated.current = true;
      let delay = 140;
      const tick = () => {
        step(dir);
        delay = Math.max(45, delay * 0.85);
        repeatTimer.current = setTimeout(tick, delay);
      };
      tick();
    }, 350);
  };

  const stopHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (repeatTimer.current) clearTimeout(repeatTimer.current);
    holdTimer.current = null;
    repeatTimer.current = null;
  };

  const tap = (dir: 1 | -1) => {
    if (repeated.current) {
      repeated.current = false;
      return;
    }
    step(dir);
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-10 py-10">
      <div className="text-[clamp(5rem,22vw,11rem)] font-semibold leading-none text-fg">
        <NumberRoll value={value} />
      </div>

      <div className="flex items-center gap-4">
        <HoldButton label="Decrement" onTap={() => tap(-1)} onDown={() => startHold(-1)} onUp={stopHold}>
          <Minus size={30} />
        </HoldButton>
        <HoldButton label="Increment" primary onTap={() => tap(1)} onDown={() => startHold(1)} onUp={stopHold}>
          <Plus size={30} />
        </HoldButton>
      </div>

      <motion.button
        whileTap={tapScale}
        transition={spring.snappy}
        onClick={() => {
          feedback("pop");
          reset();
        }}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg cursor-pointer"
      >
        <RotateCcw size={15} /> Reset
      </motion.button>

      <p className="text-xs text-subtle">Tap to count, hold to count faster</p>
    </div>
  );
}

function HoldButton({
  children,
  label,
  primary,
  onTap,
  onDown,
  onUp,
}: {
  children: React.ReactNode;
  label: string;
  primary?: boolean;
  onTap: () => void;
  onDown: () => void;
  onUp: () => void;
}) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      transition={spring.snappy}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onClick={onTap}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex h-20 w-20 items-center justify-center rounded-3xl select-none cursor-pointer shadow-sm ${
        primary ? "bg-accent text-accent-fg" : "bg-surface border border-border-strong text-fg"
      }`}
    >
      {children}
    </motion.button>
  );
}
