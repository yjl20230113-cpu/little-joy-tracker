"use client";

import { useLayoutEffect, useRef } from "react";
import type { TextareaHTMLAttributes } from "react";

type AutoGrowTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

function syncHeight(element: HTMLTextAreaElement) {
  element.style.height = "0px";
  element.style.height = `${element.scrollHeight}px`;
}

export function AutoGrowTextarea({
  className = "",
  onInput,
  value,
  ...props
}: AutoGrowTextareaProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const element = localRef.current;

    if (!element) {
      return;
    }

    syncHeight(element);
  }, [value]);

  return (
    <textarea
      {...props}
      ref={localRef}
      value={value}
      onInput={(event) => {
        syncHeight(event.currentTarget);
        onInput?.(event);
      }}
      rows={1}
      className={`overflow-hidden resize-none ${className}`}
    />
  );
}
