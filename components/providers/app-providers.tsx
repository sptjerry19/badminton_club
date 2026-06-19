"use client";

import { LoadingModal } from "@/components/loading-modal";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LoadingModal />
    </>
  );
}
