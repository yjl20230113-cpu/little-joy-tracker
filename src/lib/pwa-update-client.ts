"use client";

import { useEffect, useState } from "react";

const updateAvailableEvent = "ljt:update-available-changed";

export const updateAvailableStorageKey = "ljt_update_available_build";

function emitUpdateAvailableChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(updateAvailableEvent));
}

function safeGetItem(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (e.g. private mode).
  }
}

function safeRemoveItem(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures (e.g. private mode).
  }
}

export function getUpdateAvailableBuildId() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = safeGetItem(updateAvailableStorageKey);
  return value?.trim() ? value.trim() : null;
}

export function setUpdateAvailableBuildId(buildId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const nextValue = buildId.trim();
  if (!nextValue) {
    return;
  }

  const currentValue = getUpdateAvailableBuildId();
  if (currentValue === nextValue) {
    return;
  }

  safeSetItem(updateAvailableStorageKey, nextValue);
  emitUpdateAvailableChanged();
}

export function clearUpdateAvailableBuildId() {
  if (typeof window === "undefined") {
    return;
  }

  const currentValue = getUpdateAvailableBuildId();
  if (!currentValue) {
    return;
  }

  safeRemoveItem(updateAvailableStorageKey);
  emitUpdateAvailableChanged();
}

export function useUpdateAvailableBuildId() {
  const [buildId, setBuildId] = useState<string | null>(() => getUpdateAvailableBuildId());

  useEffect(() => {
    function sync() {
      setBuildId(getUpdateAvailableBuildId());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === updateAvailableStorageKey) {
        sync();
      }
    }

    window.addEventListener(updateAvailableEvent, sync);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(updateAvailableEvent, sync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return buildId;
}
