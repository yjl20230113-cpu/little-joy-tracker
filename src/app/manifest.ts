import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Little Joy Tracker 小美好记录器",
    short_name: "小美好",
    description: "一个轻快、私密、适合在 iPhone 上记录生活片刻的小美好记录器。",
    start_url: "/?tab=quick-entry",
    display: "standalone",
    background_color: "#f3ebe7",
    theme_color: "#f3ebe7",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
