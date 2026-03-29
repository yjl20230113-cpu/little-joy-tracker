"use client";

import { useEffect } from "react";
import {
  clearUpdateAvailableBuildId,
  setUpdateAvailableBuildId,
} from "@/lib/pwa-update-client";

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    async function clearDevPwaState() {
      clearUpdateAvailableBuildId();

      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        } catch {
          // Dev cleanup failures should never block the page.
        }
      }

      if (typeof caches === "undefined") {
        return;
      }

      try {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter((key) => key.startsWith("little-joy-tracker-shell-"))
            .map((key) => caches.delete(key)),
        );
      } catch {
        // Cache cleanup failures should never block the page.
      }
    }

    if (process.env.NODE_ENV !== "production") {
      void clearDevPwaState();
      return;
    }

    const runningBuildId =
      document
        .querySelector('meta[name="ljt-build-id"]')
        ?.getAttribute("content")
        ?.trim() ??
      "";

    async function fetchLatestBuildId() {
      try {
        const url = new URL("/__version", window.location.origin);
        url.searchParams.set("t", String(Date.now()));

        const response = await fetch(url.toString(), { cache: "no-store" });
        if (!response.ok) {
          return null;
        }

        const value = (await response.text()).trim();
        return value ? value : null;
      } catch {
        return null;
      }
    }

    async function checkForUpdate() {
      if (!runningBuildId) {
        return;
      }

      const latestBuildId = await fetchLatestBuildId();

      if (!latestBuildId) {
        return;
      }

      if (latestBuildId !== runningBuildId) {
        setUpdateAvailableBuildId(latestBuildId);
        return;
      }

      clearUpdateAvailableBuildId();
    }

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failure should not block the app shell.
      });
    }

    void checkForUpdate();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void checkForUpdate();
      }
    }

    function handleOnline() {
      void checkForUpdate();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
