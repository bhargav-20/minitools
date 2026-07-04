"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { feedback } from "@/lib/sound";

export default function QrPage() {
  const [text, setText] = useState("https://minitools.app");
  const [debounced, setDebounced] = useState(text);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 150);
    return () => clearTimeout(t);
  }, [text]);

  const qr = useMemo(() => {
    try {
      const q = QRCode.create(debounced || " ", { errorCorrectionLevel: "M" });
      return { size: q.modules.size, data: q.modules.data as Uint8Array };
    } catch {
      return { size: 0, data: new Uint8Array() };
    }
  }, [debounced]);

  const download = async () => {
    feedback("success");
    const url = await QRCode.toDataURL(debounced || " ", { margin: 2, width: 1024, errorCorrectionLevel: "M" });
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr.png";
    a.click();
  };

  const { size, data } = qr;
  const rects: React.ReactNode[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (data[r * size + c]) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c}
            y={r}
            width={1.02}
            height={1.02}
            rx={0.15}
            fill="#111111"
            className="qr-cell"
            style={{ animationDelay: `${((r + c) / (2 * size)) * 0.5}s` }}
          />
        );
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-md flex-col items-center justify-center gap-7 py-10">
      <div className="rounded-3xl bg-white p-5 shadow-lg">
        <svg key={debounced} width={264} height={264} viewBox={`-2 -2 ${size + 4} ${size + 4}`} shapeRendering="crispEdges">
          {rects}
        </svg>
      </div>

      <div className="w-full">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a URL or text"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-border-strong"
        />
      </div>

      <button
        onClick={download}
        className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg cursor-pointer active:scale-95"
      >
        <Download size={17} /> Download PNG
      </button>
    </div>
  );
}
