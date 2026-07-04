import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minitools — a bundle of delightful mini-tools",
    short_name: "Minitools",
    description: "A cohesive bundle of tactile, beautifully-crafted mini-tools for the web.",
    start_url: `${bp}/`,
    id: `${bp}/`,
    scope: `${bp}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    categories: ["utilities", "productivity"],
    icons: [
      { src: `${bp}/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${bp}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${bp}/icon-maskable.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
