"use client";

import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";

import { useLoadingStore } from "@/lib/store/loading";
import { cn } from "@/lib/utils";

const SHOW_DELAY_MS = 150;

export function LoadingModal() {
  const pendingCount = useLoadingStore((s) => s.pendingCount);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pendingCount <= 0) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pendingCount]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Đang xử lý"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-black/40 backdrop-blur-sm",
        "animate-in fade-in-0 duration-150"
      )}
    >
      <div className="flex flex-col items-center gap-3 rounded-xl bg-popover px-8 py-6 ring-1 ring-foreground/10 shadow-lg">
        <Loader2Icon className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang xử lý...</p>
      </div>
    </div>
  );
}
