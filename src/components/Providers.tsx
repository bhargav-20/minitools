"use client";

import { useState } from "react";
import { SettingsProvider } from "@/lib/theme";
import { Header } from "./Header";
import { CommandPalette } from "./CommandPalette";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

export function Providers({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  return (
    <SettingsProvider>
      <Header onOpenPalette={() => setPaletteOpen(true)} />
      <main
        className="mx-auto w-full max-w-5xl flex-1"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {children}
      </main>
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <ServiceWorkerRegister />
    </SettingsProvider>
  );
}
