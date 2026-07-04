"use client";

import { motion } from "framer-motion";
import { spring } from "@/lib/motion";

function Digit({ value }: { value: number }) {
  return (
    <span className="relative inline-block overflow-hidden" style={{ height: "1em", width: "0.62em" }}>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        animate={{ y: `-${value}em` }}
        transition={spring.soft}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{ height: "1em", lineHeight: 1 }}>
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function NumberRoll({ value, className = "" }: { value: number; className?: string }) {
  const str = Math.trunc(Math.abs(value)).toString();
  const negative = value < 0;
  return (
    <span className={`tabular inline-flex items-center leading-none ${className}`}>
      {negative && <span className="mr-[0.05em]">−</span>}
      {str.split("").map((ch, i) => (
        <Digit key={str.length - i} value={Number(ch)} />
      ))}
    </span>
  );
}
