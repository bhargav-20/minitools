"use client";

type SoundName = "tick" | "roll" | "success" | "error" | "pop";

let ctx: AudioContext | null = null;
let enabled = true;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, when = 0) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function sweep(from: number, to: number, dur: number, gain: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const HAPTIC: Record<SoundName, number | number[]> = {
  tick: 8,
  pop: 12,
  roll: [10, 30, 12],
  success: [12, 40, 18],
  error: [30, 40, 30],
};

export function playSound(name: SoundName) {
  if (!enabled) return;
  switch (name) {
    case "tick":
      tone(880, 0.05, "square", 0.05);
      break;
    case "pop":
      tone(520, 0.09, "sine", 0.08);
      break;
    case "roll":
      sweep(320, 140, 0.4, 0.06);
      break;
    case "success":
      tone(660, 0.1, "sine", 0.07);
      tone(990, 0.14, "sine", 0.06, 0.08);
      break;
    case "error":
      tone(160, 0.18, "sawtooth", 0.05);
      break;
  }
}

export function haptic(name: SoundName) {
  if (!enabled) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(HAPTIC[name]);
  }
}

/** Fire sound + matching haptic together. */
export function feedback(name: SoundName) {
  playSound(name);
  haptic(name);
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
}
export function getSoundEnabled() {
  return enabled;
}
