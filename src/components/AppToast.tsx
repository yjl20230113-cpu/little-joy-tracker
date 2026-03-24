import { useEffect, useRef, useState } from "react";

type AppToastProps = {
  message: string;
  onClear?: () => void;
  duration?: number;
};

export function AppToast({
  message,
  onClear,
  duration = 3000,
}: AppToastProps) {
  const [visibleMessage, setVisibleMessage] = useState(message);
  const onClearRef = useRef(onClear);

  useEffect(() => {
    onClearRef.current = onClear;
  }, [onClear]);

  useEffect(() => {
    if (!message || message === visibleMessage) {
      return;
    }

    const showId = window.setTimeout(() => {
      setVisibleMessage(message);
    }, 0);

    return () => window.clearTimeout(showId);
  }, [message, visibleMessage]);

  useEffect(() => {
    if (!visibleMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onClearRef.current?.();
      setVisibleMessage("");
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, visibleMessage]);

  if (!visibleMessage) {
    return null;
  }

  return (
    <div
      data-ui="app-toast"
      data-testid="app-toast"
      className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center px-6"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-[18rem] rounded-[1.15rem] bg-[rgba(34,25,18,0.88)] px-4.5 py-3 text-center text-[0.9rem] font-semibold leading-6 text-white shadow-[0_18px_32px_-20px_rgba(29,29,3,0.45)] backdrop-blur-[6px]">
        {visibleMessage}
      </div>
    </div>
  );
}
