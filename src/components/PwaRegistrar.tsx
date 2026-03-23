"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure should not block the app shell.
    });
  }, []);

  return null;
}
