import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Little Joy Tracker",
  title: "小美好记录器",
  description: "一个轻快、私密、适合在 iPhone 上记录生活片刻的小美好记录器。",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "小美好",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff8c8",
};

const rootFontVariables = {
  "--font-display": '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif',
  "--font-body": '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
} as CSSProperties;

function getBuildId() {
  try {
    return fs
      .readFileSync(path.join(process.cwd(), ".next", "BUILD_ID"), "utf-8")
      .trim();
  } catch {
    return "";
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const buildId = getBuildId();

  return (
    <html lang="zh-CN" className="h-full antialiased" style={rootFontVariables}>
      <head>
        {buildId ? <meta name="ljt-build-id" content={buildId} /> : null}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <PwaRegistrar />
      </body>
    </html>
  );
}
