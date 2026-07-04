"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setSoundEnabled } from "./sound";

export type ThemeMode = "light" | "dark" | "system";

export const ACCENTS = [
  { name: "Violet", value: "#6d5efc" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Green", value: "#22c55e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Pink", value: "#ec4899" },
];

interface Settings {
  mode: ThemeMode;
  accent: string;
  soundOn: boolean;
  setMode: (m: ThemeMode) => void;
  cycleMode: () => void;
  setAccent: (c: string) => void;
  toggleSound: () => void;
}

const Ctx = createContext<Settings | null>(null);

function applyMode(mode: ThemeMode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [accent, setAccentState] = useState<string>(ACCENTS[0].value);
  const [soundOn, setSoundOn] = useState<boolean>(false);

  useEffect(() => {
    const m = (localStorage.getItem("minitools:mode") as ThemeMode) || "system";
    const a = localStorage.getItem("minitools:accent") || ACCENTS[0].value;
    const s = localStorage.getItem("minitools:sound") === "1";
    setModeState(m);
    setAccentState(a);
    setSoundOn(s);
    setSoundEnabled(s);
    applyMode(m);
    document.documentElement.style.setProperty("--accent", a);
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("minitools:mode", m);
    applyMode(m);
  }, []);

  const cycleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : prev === "dark" ? "system" : "light";
      localStorage.setItem("minitools:mode", next);
      applyMode(next);
      return next;
    });
  }, []);

  const setAccent = useCallback((c: string) => {
    setAccentState(c);
    localStorage.setItem("minitools:accent", c);
    document.documentElement.style.setProperty("--accent", c);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem("minitools:sound", next ? "1" : "0");
      setSoundEnabled(next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ mode, accent, soundOn, setMode, cycleMode, setAccent, toggleSound }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSettings must be used within SettingsProvider");
  return c;
}

/** Inline script to set theme + accent before paint (avoids FOUC). */
export const themeInitScript = `(function(){try{var m=localStorage.getItem('minitools:mode')||'system';var a=localStorage.getItem('minitools:accent')||'${ACCENTS[0].value}';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');document.documentElement.style.setProperty('--accent',a);}catch(e){}})();`;
