import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main className="joy-grid flex min-h-dvh items-center justify-center px-4 py-6 sm:min-h-screen sm:px-6">
      <div className="joy-card flex w-full max-w-sm items-center gap-3 rounded-[2rem] px-5 py-4 text-sm text-[var(--muted)]">
        <LoaderCircle className="size-4 animate-spin text-[var(--primary)]" />
        {"\u6b63\u5728\u52a0\u8f7d\u4e2d"}
      </div>
    </main>
  );
}
